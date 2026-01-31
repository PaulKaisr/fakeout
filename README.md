# FakeOut

**Can you spot the difference?**
FakeOut is a browser game that challenges you to distinguish between real and AI-generated media.

## Inspiration

The idea for **FakeOut** came when I started encountering more and more short-form videos that made me second-guess whether they were AI-generated or real. If I — as a technically proficient person — struggle to recognize these, how can my parents’ generation deal with this? How can they identify which videos are fake, or at least develop an intuition for it and look out for features that might make them question whether the video or image they are seeing is real?

## What it does

**FakeOut** is a weekly no-sign-up browser game that challenges users to identify AI-generated content when paired directly against a similar but real image or video. In five rounds, the game shows pairs of media files. After each guess, the user receives feedback in the form of a percentage score indicating how many people guessed that pairing correctly. They can also view the prompt that was used to generate the fake image or video to learn what to look out for — what the model might have failed to reproduce correctly even though the information was included in the prompt. We also encourage players to challenge their friends or family to play along, compare results, or discuss their findings on Reddit — sharing how they figured out which ones were fake.

## How we built it

As a solo developer with limited time and money, I tried to create a stack that would keep operating costs low for now. That’s why I looked for free hosting options and ended up using **Vercel** for the frontend, **Supabase** for the SQL-stored data, and **AWS Lambda** to trigger automations like the generation of new rounds.

The frontend was implemented in Vue.js using Vuetify as the component library and Tailwind CSS for styling, along with some custom CSS.

The automations are coded in Python and mainly trigger Gemini API endpoints. The automation works as follows:

- We scrape videos and images from a license-free library.
- We call the Gemini multimodal model for _meta-prompting_, letting it generate a prompt based on what it sees in the video or image and explaining it as thoroughly as possible.
- We send this detailed prompt to the Gemini API, invoking the latest Veo 3 model for video generation and the Nano Banana Pro for image generation.

A huge shout-out to the **Antigravity IDE**, which enabled me to code all of this solo and within a limited timeframe — thanks to its generous token limits and multimodality that allows quick implementation of frontend designs from reference images.

## Challenges we ran into

Working on this project alongside a 9-to-5 job was definitely the biggest challenge. My passion for programming and for advancing AI literacy helped me overcome it, but it was definitely a stretch.

It was also difficult to find high-quality license-free videos in an automated way that would make the game interesting for users. In the early stages, many scraped videos were such low quality that the difference in resolution or lighting conditions was a dead giveaway — making it too easy for players to spot which video was AI-generated and which wasn’t.

## Accomplishments that we're proud of

I’m really proud that I was able to bring this project to life in such a limited time, and that people were genuinely interested in it. Shortly after I first published the site, I posted about it on Reddit — and one of my posts gained more than 140k views with lots of positive feedback. Many people told me they would definitely show it to their parents or relatives.

I’m a big fan of AI and use it for several hours every day, but I think it’s crucial for us to foster AI literacy among everyone. Seeing that my small side project could contribute to that for some people made me really proud.

## What we learned

Working in a more traditional software development job, it was fascinating to see how AI enables developers to quickly produce MVPs, use agents in daily workflows to accelerate development by 10x, and still achieve relatively high-quality results.

Personally, I learned a lot about modern software development — including what tools and frameworks are popular today, the importance of using agents during development, the impact MCP servers can have when set up with the right tools, and the everyday life of solo developers. I also discovered how _plug-and-play_ it is to integrate Gemini API tools and how quickly ambitious visions can come to life nowadays.

## What's next for FakeOut

Depending on the interest this project receives, I would love to keep working on it. I’d like to implement new features — including AI text detection challenges, leaderboards, and native support for more languages.

I also plan to write blog articles on the site to update people on results and discussions happening on Reddit or elsewhere. I’d love to explore _marketing_ tools to help the game reach people who are not yet closely involved with AI — where AI-detection skills may currently be less developed.

## Project Structure

The project is organized into the following directories:

- **`code/frontend`**: The Vue.js application using Vuetify and Tailwind CSS.
- **`code/scraper`**: Python scripts for scraping license-free media.
- **`code/describe-and-generate`**: Automation for generating AI prompts and media (Gemini API).
- **`code/notify-users`**: Lambda functions for user notifications.
- **`code/terraform`**: Infrastructure as Code for deploying resources.

## Getting Started (Frontend)

To run the frontend locally:

1.  Navigate to the frontend directory:

    ```bash
    cd code/frontend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
