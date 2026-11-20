import SmoothScroll from "@/src/components/smooth";
import PixelBackground from "@/src/components/pixel-background";
import Nav from "@/src/components/nav";
import Hero from "@/src/components/hero";
import About from "@/src/components/about";
import Skills from "@/src/components/skills";
import Blog from "@/src/components/blog";
import Testimony, { type Testi } from "@/src/components/testimony";
import Contact, { type ContactLinkData } from "@/src/components/contact";
import Footer from "@/src/components/footer";
import type { Project, Skill, Experience, BlogPost } from "@/src/lib/data";
import {
  sampleWorks,
  sampleExperience,
  sampleHardSkills,
  sampleSoftSkills,
  samplePosts,
  sampleTestimonials,
} from "@/src/lib/data";

export type WorkData = Omit<Project, "id"> & { id: number };
export type ExperienceData = Experience & { id: number };
export type BlogPostData = BlogPost;

// the database is being restructured — for now every section renders
// local sample content from src/lib/data.ts. when the new data layer
// lands, swap these constants for real queries and delete the samples.

const works: WorkData[] = sampleWorks;
const experience: ExperienceData[] = sampleExperience;
const hardSkills: Skill[] = sampleHardSkills;
const softSkills: Skill[] = sampleSoftSkills;
const posts: BlogPostData[] = samplePosts;
const testimonials: Testi[] = sampleTestimonials;
const links: ContactLinkData[] = []; // contact falls back to real links in contact.tsx

export default function Home() {
  return (
    <SmoothScroll>
      <PixelBackground />
      <Nav />
      <div className="page-shell" id="page-shell">
        <main>
          <Hero />
          <About works={works} experience={experience} />
          <Skills skills={hardSkills} softSkills={softSkills} />
          <Blog posts={posts} />
          <Testimony initial={testimonials} />
          <Contact links={links} />
        </main>
        <Footer links={links} />
      </div>
    </SmoothScroll>
  );
}
