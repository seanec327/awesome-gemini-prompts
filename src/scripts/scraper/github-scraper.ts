import { Octokit } from "@octokit/rest";
import * as crypto from 'crypto';
import { GeminiPrompt } from '../../schema/prompt';

// Helper: Generate deterministic ID from URL
const generateId = (source: string, url: string) => {
    return `${source}-${crypto.createHash('md5').update(url).digest('hex').substring(0, 12)}`;
};

export async function scrapeGithub(): Promise<GeminiPrompt[]> {
  console.log('🐙 Starting GitHub Scraper (Target: google-gemini/cookbook)...');
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('⚠️ No GITHUB_TOKEN found. Skipping GitHub scraping.');
    return [];
  }

  const octokit = new Octokit({ 
    auth: token,
    log: { debug: () => {}, info: () => {}, warn: console.warn, error: console.error }
  });
  const prompts: GeminiPrompt[] = [];

  // Define Repos and Strategies
  const TARGET_REPOS = [
    { repo: 'google-gemini/cookbook', strategy: 'notebook' },
    { repo: 'YouMind-OpenLab/awesome-nano-banana-pro-prompts', strategy: 'issues' },
    { repo: 'f/awesome-chatgpt-prompts', strategy: 'csv', path: 'prompts.csv' } 
  ];

  try {
  for (const target of TARGET_REPOS) {
      const [owner, repoName] = target.repo.split('/');
      console.log(`   🚀 Scraping ${target.repo} using [${target.strategy}] strategy...`);
      
      try {
          if (target.strategy === 'issues') {
              // Strategy B: Parse GitHub Issues (Source of Truth)
              const issues = await octokit.issues.listForRepo({
                  owner,
                  repo: repoName,
                  state: 'all',
                  labels: 'approved',
                  per_page: 100
              });

              console.log(`      Found ${issues.data.length} approved issues.`);

              for (const issue of issues.data) {
                  // ... (Existing Issue Logic)
                  const body = issue.body || "";
                  const extractSection = (header: string): string => {
                      const regex = new RegExp(`### ${header}\\s+([\\s\\S]*?)(?:###|$)`, 'i');
                      const match = body.match(regex);
                      return match ? match[1].trim() : "";
                  };

                  const title = extractSection("Prompt Title") || issue.title;
                  const promptText = extractSection("Prompt");
                  const description = extractSection("Description");
                  
                  if (promptText) {
                       prompts.push({
                           id: `github-issue-${issue.number}`,
                           title: title,
                           description: description || `Submission by ${issue.user?.login}`,
                           tags: ["nano-banana", "community-submission"],
                           compatibleModels: ["gemini-2.5-flash"], // Default for these
                           modality: ["text"], // Assume text unless images found
                           contents: [{
                               role: "user",
                               parts: [{ text: promptText }],
                           }],
                           originalSourceUrl: issue.html_url,
                           author: {
                               name: issue.user?.login || "Anonymous",
                               url: issue.html_url,
                               platform: "GitHub"
                           },
                           stats: { views: 0, copies: 0, likes: issue.reactions?.total_count || 0 },
                           createdAt: issue.created_at,
                           updatedAt: issue.updated_at
                       });
                  }
              }
              console.log(`      + Extracted ${prompts.filter(p => p.originalSourceUrl?.includes("issues")).length} prompts from Issues.`);

          } else if (target.strategy === 'csv') {
              // Strategy C: Parse CSV File (awesome-chatgpt-prompts)
              const filePath = (target as any).path;
              if (!filePath) continue;

              const { data: contentData } = await octokit.repos.getContent({
                  owner,
                  repo: repoName,
                  path: filePath,
              });

              let csvContent = "";
              
              if ('content' in contentData && contentData.content) {
                   csvContent = Buffer.from(contentData.content, 'base64').toString('utf-8');
              } else if ('download_url' in contentData && contentData.download_url) {
                   console.log(`      File too large for API, downloading raw content from ${contentData.download_url}...`);
                   const response = await fetch(contentData.download_url as string);
                   csvContent = await response.text();
              }

              if (csvContent) {
                   // Robust CSV Parser (State Machine) to handle newlines inside quotes
                   // Helper function defined inside or outside loop
                   const parseCSV = (text: string) => {
                        // ... parser logic ...
                        const rows: string[][] = [];
                        let currentRow: string[] = [];
                        let currentCell = '';
                        let insideQuotes = false;
                        
                        for (let i = 0; i < text.length; i++) {
                            const char = text[i];
                            const nextChar = text[i + 1];
                            
                            if (char === '"') {
                                if (insideQuotes && nextChar === '"') {
                                    currentCell += '"';
                                    i++; // Skip escape quote
                                } else {
                                    insideQuotes = !insideQuotes;
                                }
                            } else if (char === ',' && !insideQuotes) {
                                currentRow.push(currentCell);
                                currentCell = '';
                            } else if ((char === '\r' || char === '\n') && !insideQuotes) {
                                // End of line
                                currentRow.push(currentCell);
                                rows.push(currentRow);
                                currentRow = [];
                                currentCell = '';
                                if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
                            } else {
                                currentCell += char;
                            }
                        }
                        // Handle last row if no newline at EOF
                        if (currentCell || currentRow.length > 0) {
                            currentRow.push(currentCell);
                            rows.push(currentRow);
                        }
                        return rows;
                   };

                   const rows = parseCSV(csvContent);
                   // Header: act,prompt,for_devs,type,contributor
                   // Skip header
                   const dataRows = rows.slice(1);
                   let addedCount = 0;

                   for (const row of dataRows) {
                       if (row.length < 2) continue; // Skip empty/invalid rows

                       // Column 0: act, Column 1: prompt
                       const act = row[0];
                       const prompt = row[1];

                       if (act && prompt) {
                           prompts.push({
                               id: generateId('github-csv', act),
                               title: act,
                               description: `Act as a ${act}`,
                               tags: ["roleplay", "persona"],
                               compatibleModels: ["gemini-2.5-pro"],
                               modality: ["text"],
                               contents: [{ role: "user", parts: [{ text: prompt }] }],
                               originalSourceUrl: `https://github.com/${target.repo}/blob/main/${filePath}#${encodeURIComponent(act)}`,
                               author: { name: owner, platform: "GitHub" },
                               createdAt: new Date().toISOString(),
                               stats: { views: 0, copies: 0, likes: 0 }
                           });
                           addedCount++;
                       }
                   }
                   console.log(`      + Extracted ${addedCount} prompts from CSV.`);
              }
          
          } else if (target.strategy === 'notebook') {
              // Strategy A: Search for .ipynb files (Legacy)
              // ... existing ipynb logic (simplified placeholder for now as we focus on CSV)
              console.log("      (Notebook scraping skipped for speed in this iteration)");
          }

      } catch (err) {
          console.error(`   ❌ Error scraping ${target.repo}:`, err);
      }
  }

  } catch (error: any) {
    console.error('❌ GitHub scraping failed:', error.message || error);
  }

  return prompts;
}
