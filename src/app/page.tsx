import SmoothScroll from "@/src/components/smooth";
import PixelBackground from "@/src/components/pixel-background";
import Nav from "@/src/components/nav";
import Hero from "@/src/components/hero";
import About from "@/src/components/about";
import Skills from "@/src/components/skills";
import Blog from "@/src/components/blog";
import Testimony from "@/src/components/testimony";
import Contact from "@/src/components/contact";
import Footer from "@/src/components/footer";
import type { Skill, BlogPost } from "@/src/lib/data";
import { getWorks, getExperience, getSkills, getPosts, getTestimonials, getLinks } from "@/src/lib/cms";
import type { WorkRow, ExpRow } from "@/src/lib/cms";

export type WorkData = WorkRow;
export type ExperienceData = ExpRow;
export type BlogPostData = BlogPost;

// content lives in supabase (managed via /admin) — every query falls
// back to the sample data in src/lib/data.ts until the tables exist
export default async function Home() {
  const [works, experience, skills, posts, testimonials, links] = await Promise.all([
    getWorks(),
    getExperience(),
    getSkills(),
    getPosts(),
    getTestimonials(),
    getLinks(),
  ]);

  return (
    <SmoothScroll>
      <PixelBackground />
      <Nav />
      <div className="page-shell" id="page-shell">
        <main>
          <Hero />
          <About works={works} experience={experience} />
          <Skills skills={skills.hard} softSkills={skills.soft} />
          <Blog posts={posts} />
          <Testimony initial={testimonials} />
          <Contact links={links} />
        </main>
        <Footer links={links} />
      </div>
    </SmoothScroll>
  );
}
