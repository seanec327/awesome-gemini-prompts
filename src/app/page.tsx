import LandingPage from './landing/page';
import prompts from '../../data/prompts.json';

export default function Home() {
  return <LandingPage promptCount={prompts.length} />;
}
