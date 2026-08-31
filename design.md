# AI-Powered Smart Learning Platform --- Frontend Design System & Page Blueprint

> **Project:** SIH26101 --- AI-Powered Smart Learning Platform\
> **Ministry:** Ministry of Statistics & Programme Implementation
> (MoSPI)\
> **Theme:** Smart Education\
> **Primary users:** Government officials, statisticians, analysts, and
> data personnel in India's Official Statistical System\
> **Current implementation:** Full-stack prototype with SQLite persistence,
> prototype authentication, AI Tutor/RAG, OCR document processing, and
> connected learner/admin data flows.

------------------------------------------------------------------------

## 1. Design Direction

### 1.1 Core design decision

The platform should use **LeetCode as the primary UX reference**,
especially for:

-   dense but organized information architecture
-   dark-first professional workspace
-   persistent top navigation
-   left-side navigation/context areas
-   card-based dashboards
-   progress and problem-solving patterns
-   tabs for switching between related datasets/content
-   compact typography and spacing
-   clear status indicators
-   focused learning/workspace screens
-   a strong distinction between the learning area and the public
    landing page

This should be treated as a **design-language reference, not a
pixel-for-pixel clone**. The product needs its own government-learning
identity, terminology, iconography, illustrations, and content
hierarchy.

### 1.2 Product personality

The UI should feel:

**Professional + Analytical + Government-grade + Modern + Trustworthy +
Skill-focused**

Avoid:

-   generic AI gradients everywhere
-   excessive glassmorphism
-   oversized marketing sections
-   cartoon education graphics
-   excessive animations
-   neon "AI" aesthetics
-   huge empty whitespace on application screens

The experience should feel closer to a **professional analytics/learning
workstation** than a consumer ed-tech app.

------------------------------------------------------------------------

# 2. Visual Language

## 2.1 Theme

### Primary theme: Dark application UI

Use a LeetCode-inspired dark palette with a restrained
official-blue/teal accent.

Suggested tokens:

  Token              Suggested value   Usage
  ------------------ ----------------- -----------------------------
  `bg-app`           `#1A1A1A`         Main application background
  `bg-header`        `#282828`         Top navigation/header
  `bg-panel`         `#232323`         Cards and panels
  `bg-panel-hover`   `#2E2E2E`         Hover state
  `bg-input`         `#303030`         Inputs/selects
  `border-subtle`    `#3A3A3A`         Borders/dividers
  `text-primary`     `#F5F5F5`         Main text
  `text-secondary`   `#A8A8A8`         Supporting text
  `text-muted`       `#777777`         Metadata
  `accent-green`     `#2DB55D`         Completed/success
  `accent-blue`      `#3B82F6`         Primary navigation/action
  `accent-teal`      `#20C4B7`         Analytics/AI insight
  `accent-yellow`    `#F0B429`         Medium/attention
  `accent-red`       `#EF5350`         Critical/error
  `accent-purple`    `#8B7CF6`         AI/recommendation

The exact colors can be refined during implementation. Keep the accent
colors purposeful rather than decorative.

### 2.2 Light theme

The product may later support light mode, but **dark mode is the primary
SIH demo experience**.

Do not build two complete visual systems in the first frontend pass.
Establish dark mode first and structure the CSS variables so a light
theme can be added later.

------------------------------------------------------------------------

# 3. Typography

Use a clean UI font such as:

-   Inter
-   system-ui
-   -apple-system
-   Segoe UI

Recommended hierarchy:

-   Page title: 28--32px, semibold
-   Section title: 20--24px, semibold
-   Card title: 16--18px, semibold
-   Body: 14--15px
-   Metadata: 12--13px
-   Button: 14px, medium/semibold

Application screens should favor **compact typography**.

Avoid giant 60--80px marketing headings except for one hero statement on
the public landing page.

------------------------------------------------------------------------

# 4. Global Application Structure

## 4.1 Public pages

Public experience:

``` text
Landing Page
 ├── Navbar
 ├── Hero
 ├── Problem → Solution
 ├── Intelligent Skill Assessment
 ├── Personalized Learning
 ├── AI Content Generation
 ├── iGOT Course Intelligence
 ├── Analytics / Progress Preview
 ├── Trust / Government Context
 ├── CTA
 └── Footer
```

## 4.2 Authenticated application

After login:

``` text
Top Navigation
├── Logo
├── Dashboard
├── Learn
├── Assessments
├── Skill Map
├── AI Lab
├── Courses
├── Analytics
├── Notifications
└── Profile

Main Content
├── optional contextual sidebar
└── page workspace
```

The top navigation should remain visually persistent across
authenticated pages.

------------------------------------------------------------------------

# 5. Global Navigation

## 5.1 Header

Inspired by the compact LeetCode header shown in the reference.

### Left

-   Product logo
-   Product name: **StatLearn AI** / final approved project name
-   Dashboard
-   Learn
-   Assessments
-   Skill Map

### Center/right

-   Courses
-   AI Lab
-   Analytics
-   Search
-   Notifications
-   Profile/avatar
-   optional government organization indicator

### Header behavior

-   fixed/sticky
-   approximately 56--64px high
-   dark surface
-   subtle bottom border
-   no oversized navigation
-   active item receives clear visual state

### Mobile

Collapse navigation into:

-   logo
-   search
-   notification
-   hamburger/menu

------------------------------------------------------------------------

# 6. Landing Page

## Objective

The landing page must immediately communicate:

> **We identify what a government professional needs to learn, assess
> their competency, and recommend the right learning path.**

It should feel like a serious product rather than a generic AI SaaS
template.

------------------------------------------------------------------------

## 6.1 Landing Navbar

Layout:

``` text
[Logo] StatLearn AI     Platform   How it works   Features   About
                                           [Login] [Register]
```

Use a compact header.

Buttons:

-   **Login** --- secondary/outlined
-   **Register** --- primary filled

Both can be dummy buttons in the frontend-only phase.

------------------------------------------------------------------------

## 6.2 Hero

### Layout

Two-column structure.

Left:

``` text
SMART LEARNING FOR
INDIA'S OFFICIAL
STATISTICAL SYSTEM

Identify competency gaps.
Build personalized learning paths.
Measure workforce capability.

[Get Started] [Explore Platform]
```

Right:

A realistic product dashboard preview, not an abstract AI illustration.

Show:

-   competency score
-   skill radar/chart
-   recommended course
-   assessment score
-   learning progress
-   AI recommendation panel

This gives judges an immediate understanding of the actual product.

### Hero rule

The hero visual should look like the **actual application UI**.

Do not use a generic robot/brain/AI image.

------------------------------------------------------------------------

# 7. Landing Page --- Problem/Solution Section

Use a three-column problem model.

### Problem 01 --- Skill Mapping

``` text
Identify the gap
Manual competency mapping makes it difficult
to know exactly what each employee needs.
```

### Problem 02 --- Disconnected Learning

``` text
Connect the right resource
Match professional gaps with relevant
official learning resources and courses.
```

### Problem 03 --- Manual Assessment

``` text
Generate evaluation
Automatically create quizzes, MCQs and
assessment content from approved material.
```

Then transition to:

``` text
One intelligent learning layer
between workforce capability and learning resources.
```

------------------------------------------------------------------------

# 8. Intelligent Skill Assessment

This is one of the most important product sections.

Visual concept:

``` text
              Competency Profile

     Statistics         █████████░ 82%
     Data Analysis      ██████░░░░ 61%
     Visualization      ████░░░░░░ 42%
     Survey Methods     ████████░░ 73%
     Policy             █████░░░░░ 51%

          ↓ AI identifies gaps ↓

      Priority Skill Gap
      Data Visualization
      Gap severity: High
```

Use horizontal bars, radial/radar visualization, or a compact matrix.

The user should understand the value in under five seconds.

------------------------------------------------------------------------

# 9. Personalized Learning Section

Show a mock recommendation workspace.

``` text
Your Learning Path

1. Data Visualization              72% complete
2. Statistical Inference            40% complete
3. Survey Sampling                  Not started

AI Recommendation

Based on your competency profile,
prioritize "Statistical Inference".

[Start Learning]
```

Important:

Recommendations should be visually explainable.

Instead of simply:

> "AI recommends this."

Show:

> "Recommended because your assessment score in Statistical Inference is
> below the target competency level."

This makes the AI feel useful rather than decorative.

------------------------------------------------------------------------

# 10. AI Content Generation

Show a realistic assessment generator.

``` text
AI Assessment Generator

Source:
[Official Statistical Manual ▼]

Difficulty:
[Medium ▼]

Question Type:
[MCQ ▼]

Questions:
[10]

                    [Generate Assessment]

Generated Question
────────────────────────────
Which sampling method...
○ A ...
○ B ...
○ C ...
○ D ...

[Regenerate] [Save Assessment]
```

This should communicate the third core problem solution: reducing manual
assessment/content creation.

------------------------------------------------------------------------

# 11. Course Intelligence / iGOT Integration

The UI should treat iGOT as a learning-resource ecosystem that can be
intelligently surfaced.

Do not make the entire platform visually dependent on the external
platform.

Example:

``` text
Recommended Learning Resources

Course                              Match       Reason
────────────────────────────────────────────────────────
Statistical Methods                 94%         Skill gap
Data Visualization                  88%         Role requirement
Survey Methodology                  81%         Assessment result

[View course]
```

Use "Match" as an explainable relevance indicator.

------------------------------------------------------------------------

# 12. Landing Page --- Analytics Preview

Show the management value.

### For individual

-   competency score
-   completed learning
-   current learning path
-   assessment performance
-   skill gaps

### For training officers

-   workforce readiness
-   common skill gaps
-   course completion
-   assessment performance
-   high-priority competencies

Example:

``` text
Workforce Capability Overview

Employees assessed     1,248
Learning paths active    923
Avg competency          74%
Critical gaps             17
```

Numbers are mock data for frontend demo.

------------------------------------------------------------------------

# 13. Landing CTA

Final CTA:

``` text
Build a more capable
statistical workforce.

Assess. Learn. Improve.

[Register Now]
```

Keep it simple.

------------------------------------------------------------------------

# 14. Login Page

Create a focused application-style login screen.

Layout:

``` text
                  [Logo]

             Welcome back

       Sign in to your learning workspace

       Official email
       [________________________]

       Password
       [________________________]

       [ Sign In ]

       Forgot password?

       ─────── or ───────

       [Continue with organization login]

       Don't have an account?
       Register
```

For frontend phase:

-   submit may navigate to dashboard
-   credentials can be dummy
-   show validation states
-   no real authentication required

------------------------------------------------------------------------

# 15. Register Page

Fields:

-   Full name
-   Official email
-   Employee/official ID placeholder
-   Department
-   Role
-   Organization
-   Password
-   Confirm password

Then:

``` text
[Create Account]
```

After successful dummy registration:

``` text
Profile setup → Skill assessment
```

This creates a believable product journey.

------------------------------------------------------------------------

# 16. Onboarding / Role Setup

After registration, show a short onboarding wizard.

### Step 1

``` text
Tell us about your role

Department
[Statistics ▼]

Role
[Statistical Officer ▼]

Experience
[5–10 years ▼]
```

### Step 2

``` text
Select your areas

[Data Analysis]
[Statistical Methods]
[Survey Methodology]
[Data Visualization]
[Official Statistics]
[Policy Analysis]
```

### Step 3

``` text
Let's assess your current skills

[Start Assessment]
```

The onboarding should lead naturally into competency assessment.

------------------------------------------------------------------------

# 17. Dashboard

The dashboard is the core authenticated homepage.

## Layout

Inspired by the density and hierarchy of LeetCode's profile/dashboard
pages.

``` text
┌──────────────────────────────────────────────────────┐
│ Welcome back, Officer                                │
│ Your learning command center                         │
├──────────────────────────────────────────────────────┤
│ Competency Score │ Learning │ Assessment │ Streak    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Skill Profile                    AI Recommendation   │
│ radar/bar chart                  recommended course  │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Continue Learning                                   │
│ course cards                                        │
├──────────────────────────────────────────────────────┤
│ Skill Gaps                                          │
│ high / medium / low                                 │
├──────────────────────────────────────────────────────┤
│ Recent Activity                                     │
└──────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 18. Dashboard KPI Cards

Use compact cards.

### Card 1 --- Competency

``` text
Overall Competency
78%
+6% this month
```

### Card 2 --- Learning

``` text
Learning Progress
64%
12 courses
```

### Card 3 --- Assessment

``` text
Assessment Accuracy
81%
Last assessment
```

### Card 4 --- Learning Streak

``` text
Learning Streak
7 days
Best: 12
```

The cards should resemble LeetCode's compact statistics approach.

------------------------------------------------------------------------

# 19. Skill Map Page

This page is central to the product.

### Header

``` text
Skill Map
Your competency profile across the statistical workforce framework

[Reassess Skills]
```

### Main layout

Left:

``` text
Skill categories
Statistics
Data Analysis
Data Management
Visualization
Survey Methods
Policy
```

Right:

``` text
Competency Map

Skill                  Current     Target      Gap
Statistics              86%         90%         4%
Data Analysis           61%         85%        24%
Visualization            42%         80%        38%
Survey Methods            73%         85%        12%
```

Use status:

-   Green = meets target
-   Yellow = moderate gap
-   Red = priority gap

------------------------------------------------------------------------

# 20. Skill Gap Detail

When a skill is selected:

``` text
Data Visualization

Current competency
42%

Target competency
80%

Gap
38% — High Priority

Why this matters
Required for interpreting and communicating
official statistical outputs.

Recommended learning
──────────────────────────
Course A        94% match
Course B        87% match
Course C        81% match

[Start Recommended Path]
```

This is where the platform's intelligence should be obvious.

------------------------------------------------------------------------

# 21. Learning / Courses Page

Use a dense course-discovery layout.

### Top

``` text
Learning

[Search courses...] [Filter] [Sort]
```

### Filters

-   Skill
-   Difficulty
-   Duration
-   Department
-   Course type
-   Recommended
-   Completion status

### Course cards

``` text
Statistical Inference
Advanced
4h 20m

94% recommended for you

Because:
Your assessment shows a gap in
statistical inference.

[Continue]
```

Avoid generic e-commerce-style cards.

------------------------------------------------------------------------

# 22. Course Detail Page

Layout:

``` text
← Back to Learning

Statistical Inference
Advanced · 4h 20m

94% match for your competency profile

[Start Course]

Overview
Modules
Assessment
Resources

Why this course?
────────────────────────
Your recent assessment identified
statistical inference as a priority gap.

Learning outcomes
✓ ...
✓ ...
✓ ...
```

Progress should be persistent.

------------------------------------------------------------------------

# 23. Learning Player

This is the focused learning workspace.

### Layout

``` text
┌──────────────────────────────────────────────────────┐
│ Course title                           42% complete  │
├───────────────┬──────────────────────────────────────┤
│ Module list   │                                      │
│               │        Lesson Content                │
│ ✓ Intro       │                                      │
│ ✓ Concepts    │        Statistical Inference         │
│ → Sampling    │                                      │
│ ○ Estimation  │        content / document / video    │
│ ○ Assessment  │                                      │
│               │                                      │
│               │        [Previous] [Next]             │
└───────────────┴──────────────────────────────────────┘
```

This page should feel like a professional learning IDE.

------------------------------------------------------------------------

# 24. Assessment Page

Use a LeetCode-inspired problem-solving structure.

### Header

``` text
Assessment: Statistical Methods
Question 4 of 20

Progress ━━━━━━━━━━━━━━━░░░ 70%
```

### Main

``` text
Question 4

Which method is most appropriate for...?

○ A. ...
○ B. ...
○ C. ...
○ D. ...

[Previous]                [Next]
```

### Right rail

``` text
Questions

1 ✓
2 ✓
3 ✓
4 ●
5 ○
6 ○
...
```

At the end:

``` text
[Submit Assessment]
```

------------------------------------------------------------------------

# 25. Assessment Result

Do not only show a percentage.

Show:

``` text
Assessment Complete

82%
Competency estimate

Correct       16/20
Time          18:42

Skill breakdown

Statistical Concepts       91%
Sampling                   74%
Inference                  68%
Interpretation             88%

AI Analysis
────────────────────────
Your strongest area is...
Your highest-priority gap is...

Recommended next step:
[Learn Statistical Inference]
```

The result page should connect directly to the Skill Map and Learning
Path.

------------------------------------------------------------------------

# 26. AI Assessment Generator

This is a major differentiator.

## Generator layout

Left: controls

``` text
Source Material
[Select document]

Topic
[Statistical Sampling]

Difficulty
○ Easy
● Medium
○ Hard

Question count
[10]

Question type
[MCQ ▼]

[Generate]
```

Right: generated content

``` text
Generated Assessment

Question 01
...

Question 02
...

[Edit] [Regenerate] [Save]
```

Training officers should feel that this is a practical tool.

------------------------------------------------------------------------

# 27. AI Lab

Create a separate workspace for AI-powered functionality.

Possible tabs:

``` text
AI Lab
├── Assessment Generator
├── Question Generator
├── Learning Path Generator
├── Document Insights
└── Skill Analysis
```

The page should make each AI feature feel like a tool, not a chatbot.

Avoid putting a giant "Ask AI anything" chat box at the center.

------------------------------------------------------------------------

# 28. Document Insights

For uploaded policy/statistical material:

``` text
Document Insights

Statistical Manual — Chapter 4

Summary
Key Concepts
Learning Objectives
Potential Questions
Skill Mapping

Detected skills:
[Sampling]
[Inference]
[Data Collection]

[Generate Assessment]
[Create Learning Module]
```

This connects source documents to the assessment-generation workflow.

------------------------------------------------------------------------

# 29. Analytics Page

Differentiate between:

### Individual analytics

-   competency trend
-   assessment trend
-   learning hours
-   skill improvement
-   completed courses

### Training/admin analytics

-   department-level skill gaps
-   course adoption
-   assessment performance
-   common weak competencies
-   workforce readiness

Use charts sparingly and make every chart answer a question.

------------------------------------------------------------------------

# 30. Training Officer Dashboard

If role-based UI is supported, create a dedicated view.

Header:

``` text
Workforce Learning Overview
```

KPIs:

``` text
Employees
1,248

Assessed
1,081

Avg competency
74%

Priority gaps
17
```

Main:

``` text
Top Competency Gaps

Data Visualization       42%
Advanced Statistics      48%
Survey Methodology       55%
```

Then:

``` text
Recommended Interventions
```

This helps demonstrate government-scale impact during SIH judging.

------------------------------------------------------------------------

# 31. Notifications

Compact notification drawer.

Examples:

``` text
Assessment available
Your recommended assessment is ready.

Learning milestone
You completed Statistical Sampling.

New recommendation
A new course matches your skill gap.
```

Use unread indicators.

------------------------------------------------------------------------

# 32. Profile Page

LeetCode-inspired profile structure.

### Header

``` text
[Avatar]

Officer Name
Department / Organization
Role

[Edit Profile]
```

### Statistics

``` text
Courses completed
Assessments
Learning hours
Current streak
```

### Skill section

``` text
Competency Profile
```

### Activity

Use a contribution/activity heatmap inspired by LeetCode, but adapt it
to:

> **Learning Activity**

Cells represent learning/assessment activity, not coding submissions.

------------------------------------------------------------------------

# 33. Search

Global search should search:

-   courses
-   skills
-   assessments
-   documents
-   learning modules

Search results:

``` text
Search: sampling

Skills
Sampling Methodology

Courses
Survey Sampling Fundamentals

Assessments
Sampling Assessment

Documents
Sampling Manual
```

Keyboard shortcut can be added later:

`Ctrl/Cmd + K`

------------------------------------------------------------------------

# 34. Empty States

Every major page needs a designed empty state.

Example:

``` text
No assessment completed yet

Complete your first competency assessment
to unlock personalized learning recommendations.

[Start Assessment]
```

Avoid blank screens.

------------------------------------------------------------------------

# 35. Loading States

Use skeleton loaders rather than spinners everywhere.

Examples:

-   dashboard cards
-   course cards
-   charts
-   skill table
-   assessment questions

AI generation can use a purposeful state:

``` text
Analyzing source material...
Mapping concepts...
Generating questions...
Checking question quality...
```

This makes the AI workflow feel intentional.

------------------------------------------------------------------------

# 36. Error States

Example:

``` text
We couldn't load your learning profile.

Please try again.

[Retry]
```

Do not expose technical errors to users.

------------------------------------------------------------------------

# 37. Component System

Build reusable components before page-specific styling.

Recommended component groups:

### Navigation

-   `TopNav`
-   `Sidebar`
-   `Breadcrumbs`
-   `UserMenu`
-   `NotificationMenu`

### Data

-   `StatCard`
-   `ProgressBar`
-   `SkillBar`
-   `SkillMatrix`
-   `ChartCard`
-   `ActivityHeatmap`

### Learning

-   `CourseCard`
-   `CourseProgress`
-   `ModuleList`
-   `LearningPlayer`
-   `RecommendationCard`

### Assessment

-   `QuestionCard`
-   `OptionButton`
-   `QuestionNavigator`
-   `AssessmentProgress`
-   `ResultBreakdown`

### AI

-   `AIInsightCard`
-   `AIGeneratorPanel`
-   `GenerationStatus`
-   `SourceDocumentCard`

### Common

-   `Button`
-   `Input`
-   `Select`
-   `Modal`
-   `Tabs`
-   `Badge`
-   `Tooltip`
-   `Dropdown`
-   `Toast`
-   `Skeleton`

------------------------------------------------------------------------

# 38. Button System

Primary:

``` text
[Start Learning]
```

Secondary:

``` text
[View Details]
```

Ghost:

``` text
View all →
```

Danger:

``` text
Delete
```

AI action:

``` text
Generate Assessment
```

Do not use huge pill-shaped buttons throughout the product.

Buttons should generally have modest corner radius, approximately
4--8px.

------------------------------------------------------------------------

# 39. Card System

Cards should resemble the application's professional dashboard surfaces.

Rules:

-   subtle border
-   modest radius
-   limited shadow
-   consistent padding
-   strong title/metadata hierarchy
-   no excessive gradients

Suggested radius:

-   small: 4px
-   normal: 6px
-   modal: 8--10px

------------------------------------------------------------------------

# 40. Spacing

Use a consistent spacing scale:

``` text
4
8
12
16
20
24
32
40
48
64
```

Application screens should usually use:

-   16--24px card padding
-   24--32px page gutters
-   16px between related elements
-   24--32px between sections

------------------------------------------------------------------------

# 41. Responsive Design

## Desktop

Primary target for SIH demo.

Minimum supported desktop width:

`1280px`

## Tablet

Collapse secondary navigation.

## Mobile

Use:

-   bottom navigation or hamburger
-   stacked dashboard cards
-   single-column content
-   horizontally scrollable tabs
-   simplified charts

Do not simply shrink desktop UI.

------------------------------------------------------------------------

# 42. Accessibility

Required:

-   keyboard navigation
-   visible focus states
-   semantic HTML
-   accessible form labels
-   sufficient contrast
-   no color-only status indicators
-   charts accompanied by textual values
-   ARIA labels where required

Example:

Do not show only a red bar.

Use:

``` text
High priority gap — 38%
```

------------------------------------------------------------------------

# 43. Motion

Use restrained motion.

Allowed:

-   card hover
-   progress animation
-   tab transition
-   modal entrance
-   skeleton shimmer
-   AI generation steps

Avoid:

-   constant floating objects
-   exaggerated parallax
-   excessive page transitions
-   animated backgrounds

The product should feel fast.

------------------------------------------------------------------------

# 44. Information Architecture

Final route proposal:

``` text
/
├── /login
├── /register
├── /onboarding
│
├── /dashboard
│
├── /learn
├── /learn/:courseId
├── /learn/:courseId/player
│
├── /assessments
├── /assessments/:id
├── /assessments/:id/result
│
├── /skills
├── /skills/:skillId
│
├── /ai
├── /ai/assessment-generator
├── /ai/document-insights
│
├── /analytics
├── /admin/analytics
│
├── /profile
└── /notifications
```

Routes can be adjusted to match the existing frontend architecture.

------------------------------------------------------------------------

# 45. Primary User Journey

The most important demo flow should be:

``` text
Landing
   ↓
Register
   ↓
Role Setup
   ↓
Skill Assessment
   ↓
Competency Profile
   ↓
AI identifies gaps
   ↓
Personalized Learning Path
   ↓
Course
   ↓
Assessment
   ↓
Updated Skill Profile
   ↓
Analytics
```

This journey should work end-to-end using mock frontend data.

------------------------------------------------------------------------

# 46. Training Officer Journey

``` text
Login
 ↓
Training Dashboard
 ↓
Workforce Skill Overview
 ↓
Identify common competency gap
 ↓
Open AI Assessment Generator
 ↓
Select approved document
 ↓
Generate MCQs
 ↓
Review/edit questions
 ↓
Publish assessment
 ↓
Monitor results
```

This should be a second strong SIH demo story.

------------------------------------------------------------------------

# 47. Demo Data Strategy

Until backend integration is complete, use realistic mock data.

Do not use:

``` text
Lorem ipsum
User 123
Course XYZ
Skill ABC
```

Use believable statistical learning content:

-   Statistical Inference
-   Sampling Methodology
-   Survey Design
-   Data Visualization
-   Official Statistics
-   Data Quality
-   Regression Analysis
-   Time Series
-   Statistical Computing
-   Data Management

All names, scores, departments and course statistics can be explicitly
marked as demo/mock data where necessary.

------------------------------------------------------------------------

# 48. LeetCode-Inspired Patterns to Reuse

Use these patterns from the supplied reference:

### 1. Dense dashboard

A lot of useful information without feeling chaotic.

### 2. Dark surfaces

Multiple levels of dark gray create hierarchy.

### 3. Compact header

Keep navigation efficient.

### 4. Progress visualization

Turn learning into measurable progress.

### 5. Activity heatmap

Repurpose for learning activity.

### 6. Tabs

Use tabs instead of separate pages when content is tightly related.

### 7. Statistics blocks

Make progress measurable.

### 8. Workspace layout

Learning/assessment screens should feel like focused work environments.

### 9. Status colors

Green/yellow/red should communicate state, not decoration.

------------------------------------------------------------------------

# 49. What NOT to Copy

Do not copy:

-   LeetCode logo
-   LeetCode name
-   exact illustrations
-   exact icons
-   exact text
-   exact branding
-   exact proprietary page content
-   pixel-perfect CSS
-   coding-specific terminology

Instead, reproduce the **UX principles**:

> compact + analytical + structured + progress-oriented +
> workspace-centric

------------------------------------------------------------------------

# 50. SIH Presentation Priorities

The first frontend implementation should prioritize these screens:

## P0 --- Must look excellent

1.  Landing page
2.  Login/Register
3.  Dashboard
4.  Skill Map
5.  Skill Gap Detail
6.  Learning/Courses
7.  Course Detail
8.  Assessment
9.  Assessment Result
10. AI Assessment Generator

## P1 --- Important

11. Learning Player
12. Analytics
13. Training Officer Dashboard
14. Profile
15. Document Insights

## P2 --- Polish

16. Notifications
17. Search
18. Empty states
19. Settings
20. Light theme

------------------------------------------------------------------------

# 51. Visual Priority for SIH Judges

The judge should understand these three things immediately:

### 1. We know what the person is missing.

**Skill Mapping**

### 2. We know what they should learn next.

**Personalized Recommendation**

### 3. We can automatically evaluate/generate learning content.

**AI Assessment Generation**

Everything else should support these three ideas.

------------------------------------------------------------------------

# 52. Homepage Above-the-Fold Requirement

Before scrolling, the user should see:

``` text
Logo / Navigation

SMART LEARNING FOR
INDIA'S OFFICIAL STATISTICAL SYSTEM

Identify competency gaps.
Learn with personalized recommendations.
Measure workforce capability.

[Get Started] [Explore Platform]

              [Actual dashboard preview]
```

If a judge only sees the first screen, they should still understand the
product.

------------------------------------------------------------------------

# 53. Final Design Principle

The product should feel like:

> **"LeetCode for professional statistical learning inside India's
> government ecosystem."**

But the experience should evolve that idea into:

> **Assess → Understand → Recommend → Learn → Evaluate → Improve**

That loop is the core UX of the platform.

------------------------------------------------------------------------

# 54. Frontend Implementation Order

When implementation begins, use this order:

``` text
Phase 1
├── Design tokens
├── Typography
├── Global layout
├── Top navigation
├── Buttons/forms/cards
└── Responsive foundation

Phase 2
├── Landing page
├── Login
├── Register
└── Onboarding

Phase 3
├── Dashboard
├── Skill Map
├── Skill Detail
└── Learning Path

Phase 4
├── Course listing
├── Course detail
├── Learning player
└── Assessment

Phase 5
├── Assessment result
├── AI assessment generator
├── Document insights
└── AI Lab

Phase 6
├── Analytics
├── Training dashboard
├── Profile
└── Notifications

Phase 7
├── Responsive polish
├── Accessibility
├── Loading/empty/error states
├── Micro-interactions
└── SIH demo polish
```

------------------------------------------------------------------------

# 55. Definition of Done for the Frontend

The frontend design is successful when:

-   The landing page communicates the problem and solution immediately.
-   The application has a consistent LeetCode-inspired dark professional
    visual language.
-   Dashboard density feels purposeful rather than crowded.
-   Skill gaps are visually obvious.
-   Recommendations explain *why* a course is recommended.
-   Learning progress is visible everywhere it matters.
-   Assessments feel like a focused workspace.
-   AI functionality feels integrated into workflows rather than pasted
    on as a chatbot.
-   Training officers have a clear workforce-level view.
-   Every major state has loading, empty and error designs.
-   Login/register can be demonstrated without a backend.
-   Mock data is realistic enough for an SIH presentation.
-   The application can be navigated as one coherent product.

------------------------------------------------------------------------

## Final UX North Star

``` text
                 USER
                  │
                  ▼
             ASSESS SKILLS
                  │
                  ▼
          ┌─────────────────┐
          │ COMPETENCY MAP  │
          └─────────────────┘
                  │
                  ▼
            FIND GAPS
                  │
                  ▼
       AI PERSONALIZED PATH
                  │
                  ▼
              LEARN
                  │
                  ▼
            ASSESS AGAIN
                  │
                  ▼
        IMPROVED COMPETENCY
                  │
                  └──────────────► repeat
```

The interface should make this loop visible throughout the product.

**Primary design goal:** build a serious, dense, fast, trustworthy
learning workspace inspired by LeetCode's information architecture and
interaction patterns, while creating a distinct identity for India's
official statistical workforce.
