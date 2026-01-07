import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '../schema/prompt';
import { batchCleanPrompts } from './cleaner';

// Define the path to the data files
const DATA_DIR = path.join(process.cwd(), 'data');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');
const RAW_FILE = path.join(DATA_DIR, 'raw.json');
const PROCESSED_KEYS_FILE = path.join(DATA_DIR, 'processed_keys.json'); // Track processed candidates

async function main() {
  console.log('🧹 Starting Gemini Prompt Cleaner...');

  // 1. Load existing production data
  let existingPrompts: GeminiPrompt[] = [];
  try {
    const fileContent = await fs.readFile(PROMPTS_FILE, 'utf-8');
    existingPrompts = JSON.parse(fileContent);
    console.log(`📦 Loaded ${existingPrompts.length} existing production prompts.`);
  } catch (error) {
    console.log('📦 Creating new production data file.');
  }

  // 1b. Load processed keys (candidates already sent to LLM, whether accepted or rejected)
  let processedKeys: Set<string> = new Set();
  try {
    const keysContent = await fs.readFile(PROCESSED_KEYS_FILE, 'utf-8');
    processedKeys = new Set(JSON.parse(keysContent));
    console.log(`📋 Loaded ${processedKeys.size} previously processed candidate keys.`);
  } catch (error) {
    console.log('📋 No processed keys file found, starting fresh.');
  }

  // 2. Load raw candidates from multiple sources
  const rawCandidates: any[] = [];
  const sourceFiles = ['reddit.json', 'github.json', 'google_gallery.json', 'aistudio.json', 'x.json'];
  
  for (const file of sourceFiles) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const prompts = JSON.parse(content);
      rawCandidates.push(...prompts);
      console.log(`📥 Loaded ${prompts.length} candidates from ${file}`);
    } catch (error) {
      console.warn(`⚠️ Could not load ${file} (skipping).`);
    }
  }

  if (rawCandidates.length === 0) {
    console.error(`❌ No candidates loaded from any source file. Did you run 'npm run scrape'?`);
    process.exit(1);
  }

  // 3. Deduplicate
  // We clean candidates that are NOT already in our production DB AND not duplicates within the current batch.
  const uniqueKeys = new Set<string>();
  const seenContent = new Set<string>();

  const normalizeUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.origin + u.pathname + u.hash;
    } catch {
      return url.trim();
    }
  };

  const getNormalizedContent = (p: any): string => {
    let text = "";
    
    // 1. System Instruction
    if (p.systemInstruction?.parts) {
      text += p.systemInstruction.parts.map((part: any) => part.text).join("");
    } else if (p.promptText) {
       // Legacy or simple format
       text += p.promptText;
    }

    // 2. User/Model Contents
    if (p.contents && Array.isArray(p.contents)) {
      p.contents.forEach((c: any) => {
        if (c.parts) {
          text += c.parts.map((part: any) => part.text).join("");
        }
      });
    }

    // Normalize: lowercase and remove all non-alphanumeric for strict comparison
    // This handles "slight formatting differences" (like markdown, spaces, punctuation)
    return text.toLowerCase().replace(/[^a-z0-9]/g, "");
  };

  const getPromptKey = (p: any) => {
    // Check both field names: originalSourceUrl (cleaned data) and url (raw data)
    const sourceUrl = p.originalSourceUrl || p.url;
    if (sourceUrl) {
      return `url:${normalizeUrl(sourceUrl)}`;
    }
    if (p.title) {
      return `title:${p.title.trim().toLowerCase()}`;
    }
    return `random:${Math.random()}`; 
  };

  // A. Register existing prompts
  existingPrompts.forEach(p => {
    const pKey = getPromptKey(p);
    uniqueKeys.add(pKey);
    
    const contentFingerprint = getNormalizedContent(p);
    if (contentFingerprint.length > 10) { // Only track substantial content
       seenContent.add(contentFingerprint);
    }
  });

  const candidateKeys = new Set<string>();
  const candidateContent = new Set<string>();

  const newCandidates = rawCandidates.filter(candidate => {
     // 0. Check if already processed by LLM (regardless of accept/reject)
     const key = getPromptKey(candidate);
     if (processedKeys.has(key)) {
         return false; // Skip - already processed in a previous run
     }

     // 1. Check Identity (URL / Title) - already in production
     if (uniqueKeys.has(key)) {
         return false; 
     }

     // 1b. Check duplicate within new candidates batch
     if (candidateKeys.has(key)) {
         return false;
     }

     // 2. Check Content (Strict)
     const contentFingerprint = getNormalizedContent(candidate);
     if (contentFingerprint.length > 10 && seenContent.has(contentFingerprint)) {
         return false; // Content duplicate found!
     }
     if (contentFingerprint.length > 10 && candidateContent.has(contentFingerprint)) {
         return false; // Batch duplicate found!
     }
     
     // Do NOT add to uniqueKeys yet! Only add to candidateKeys.
     // uniqueKeys will be updated in the final merge step.
     candidateKeys.add(key);

     if (contentFingerprint.length > 10) {
        candidateContent.add(contentFingerprint);
     }
     return true;
  });

  console.log(`🔍 Found ${newCandidates.length} new candidates to clean (deduplicated against existing).`);

  // 4. Clean Data with LLM
  // We separate "Structured" (already good, e.g. from GitHub/Web) from "Unstructured" (Raw Reddit posts)
  // UPDATE: We also treat "Structured but untagged" (e.g. Twitter) as needing LLM processing to generate tags/metadata
  const structuredCandidates = newCandidates.filter(c => 
      c.contents && 
      Array.isArray(c.contents) && 
      c.tags && 
      c.tags.length > 0 &&
      // Basic Quality Filter for Structured/Community Data
      c.title && c.title.length > 3 &&
      c.description && c.description.length > 5 &&
      !c.title.toLowerCase().includes('test prompt') &&
      !c.title.toLowerCase().includes('test title') &&
      c.title.toLowerCase() !== 'test'
  );
  
  const unstructuredCandidates = newCandidates.filter(c => 
      !c.contents || 
      !Array.isArray(c.contents) || 
      !c.tags || 
      c.tags.length === 0
  );

  console.log(`   - Structured & Tagged (Skipping LLM): ${structuredCandidates.length}`);
  console.log(`   - Unstructured or Untagged (Sending to LLM): ${unstructuredCandidates.length}`);

  let cleanedPrompts: GeminiPrompt[] = [];
  if (unstructuredCandidates.length > 0) {
      cleanedPrompts = await batchCleanPrompts(unstructuredCandidates);
      
      // Mark all unstructured candidates as processed (whether accepted or rejected)
      unstructuredCandidates.forEach(c => {
          processedKeys.add(getPromptKey(c));
      });
  } else {
      console.log("✨ No unstructured candidates to clean.");
  }

  // Mark structured candidates as processed too
  structuredCandidates.forEach(c => {
      processedKeys.add(getPromptKey(c));
  });

  // Save processed keys for incremental processing
  await fs.writeFile(PROCESSED_KEYS_FILE, JSON.stringify([...processedKeys], null, 2));
  console.log(`📋 Saved ${processedKeys.size} processed keys for incremental tracking.`);
  
  // 5. Merge and Save
  // Apply deduplication to ALL new prompts (both structured and cleaned)
  const allNewPrompts = [...structuredCandidates, ...cleanedPrompts];
  
  const finalNewPrompts = allNewPrompts.filter(newPrompt => {
    const key = getPromptKey(newPrompt);
    if (uniqueKeys.has(key)) {
      console.log(`   ⚠️ Duplicate by key skipped: "${newPrompt.title}"`);
      return false;
    }

     const fingerprint = getNormalizedContent(newPrompt);
    if (fingerprint.length > 10 && seenContent.has(fingerprint)) {
      console.log(`   ⚠️ Duplicate by content skipped: "${newPrompt.title}"`);
      return false;
    }

    uniqueKeys.add(key);
    if (fingerprint.length > 10) {
      seenContent.add(fingerprint);
    }
    return true;
  });

  console.log(`✅ After final deduplication: ${finalNewPrompts.length} new prompts to add.`);
  
  const allPrompts = [...existingPrompts, ...finalNewPrompts];
  
  // Add placeholder if empty
  if (allPrompts.length === 0) {
      const placeholderExists = allPrompts.some(p => p.title === "Advanced Coding Assistant");
      if (!placeholderExists) {
          allPrompts.push({
            id: 'placeholder-advanced-coding-assistant',
            title: "Advanced Coding Assistant",
            description: "Act as an expert software engineer...",
            tags: ["coding", "python"],
            originalSourceUrl: "https://github.com/google/gemini-cookbook",
            compatibleModels: ["gemini-2.5-pro"],
            contents: [{
                role: "user",
                parts: [{ text: "Act as an expert software engineer..." }]
            }],
            author: {
               name: "Google",
               url: "https://github.com/google",
               platform: "GitHub"
            },
            stats: { views: 0, copies: 0, likes: 0 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
      }
  }

  // 6. Save to JSON
  // SAFETY CHECK: Ensure we don't accidentally wipe the database
  if (allPrompts.length < existingPrompts.length * 0.5) {
      console.error(`❌ SAFETY STOP: New prompt count (${allPrompts.length}) is significantly lower than existing (${existingPrompts.length}). Aborting save to prevent data loss.`);
      process.exit(1);
  }

  await fs.writeFile(PROMPTS_FILE, JSON.stringify(allPrompts, null, 2));
  console.log(`✅ Successfully saved ${allPrompts.length} prompts to ${PROMPTS_FILE}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
