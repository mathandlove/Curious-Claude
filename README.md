Curious Claude - Take-Home Assignment
Thank you for taking the time to review my code for Curious Claude. I built this app as a "take-home" assignment for a job interview at Anthropic.

Want a Quick Overview?
If you don’t feel like reading, I’ve summarized everything in under 5 minutes in this video:
https://youtu.be/J6O77sbyc3U

A Few Things to Know:
I pride myself on creating quick, effective prototypes. However, this is not your typical "testable prototype."

My approach is to build prototypes quickly—often "fast, dirty, and iterative"—because I believe rapid testing leads to faster iterations and easier pivots.

The goal of a prototype is to test an idea, not to produce a polished deliverable. With that in mind, I initially built Curious Claude in under 90 minutes on Replit. However, I realized that this prototype didn't adequately showcase my technical skills.

After discussing with the Hiring Liaison, I was encouraged to create a more refined prototype that would better demonstrate my coding abilities. As a result, Curious Claude now serves as a demonstration of my ability to build a functional app under tight time constraints.

Key Files to Review:
If you're interested in reviewing the app's code, the main files to look at are:

src/Pages/Home.tsx -Single page of webapp

backend/src/claudeService.ts  -Calls to Claude

backend/src/index.ts  - Backend API interface

backend/shared/claudeTypes.js  -Typescript definitions

Note on Git History:
If you're an observant technical reviewer, you may notice an unusually large Git commit. Unfortunately, I accidentally labeled .env.local as .env,local, which caused my Anthropic API key to be briefly tracked in the Git history. As a result, I had to remove 11 commits to protect the key. Apologies for the confusion!

What the App Does:
You can view Curious Claude live at:
https://curious.wonder.io (hosted on Vite and Render)

Design rationale and detailed documentation can be found here:
https://drive.google.com/drive/folders/16EFrVx5UuF6wU7-K_tOyNLuHERTWjE8k

Curious Claude uses a simple React interface to simulate a Claude-like AI conversation. The app interacts with Claude AI to determine a student's potential learning goals, asks them to select one, and then provides a banner with a suggested prompt to encourage active learning around that goal.

Future Improvements:
If I continue working on this, I'd like to explore the following areas:

Optimal methods for nudging users on prompt engineering techniques related to active learning (which I'm calling PEAL).

Ways to improve Claude’s ability to generate strong active learning sessions for students.

