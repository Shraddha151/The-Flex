Project Documentation – Property Management Dashboard
## Introduction

This project is a Property Management Dashboard inspired by Flex.
It was developed to demonstrate skills in Next.js, TypeScript, TailwindCSS, and analytics for reviews.
The app supports property details, review approvals, per-property performance, trending properties, recurring issue detection, and responsive UI design.

## Technology Stack

Next.js (App Router) – modern React framework

TypeScript – type safety and maintainability

TailwindCSS – clean, responsive styling

Vercel – deployment

In-memory mock data – to simulate real API responses

## Application Pages
## Shows gallery (main + thumbnails).

Displays title, guest/bed/bathroom counts.

Sections:

About this property – description.

Amenities – shown in bordered chips (Internet, Kitchen, Smoke Detector, etc).

Stay Policies – check-in/out, house rules, cancellation policies.

Book Your Stay card – select dates, number of guests, inquiry/availability check.

Reviews Section:

Rendered at the bottom of the page.

Uses wider width, spanning the same space as About + Inquiry combined.

Only approved reviews appear for the current property.

Includes category scores, filters, histograms, highlights, and keyword chips (when reviews come up with all these categories marked, these will automatically light up).

## Manager Dashboard (src/app/reviews/page.tsx)

Review Table:

Lists all reviews with property name, date, rating, text, and approval status.

Approve (green button) / Unapprove (red button) toggles.

Toggle: “Use approved reviews only.”

Performance by Property:

Average rating

Total review count

Low-star review count

Last review date

Trending Properties:

Logic ensures only properties with ≥2 reviews and avg ≥2.5 appear.

Prevents false trending for single 1★ or 5★ reviews.

Recurring Issues:
Only mentions those with less than 2 stars and clubs them with property names.

## Review Insights Panel (src/components/ReviewsPanel.tsx)

Embedded in property pages. Provides:

Overall score + review count.

Category scores (Cleanliness, Location, Comfort, Wi-Fi, Value).

Filters:

Text search

Minimum star rating

Topic chips (wifi, quiet, bed, etc).

Rating distribution histogram.

Highlights (key averages).

Review cards: reviewer name, date, rating badge, text, categories.

## Analytics Features

Trending properties:

Show only if property has multiple reviews (≥2).

Must have avg rating ≥2.5.

Recurring issues:

Extract keywords from review text.

Group issues + count mentions.

Show property name where issue appeared.

## Styling & UX

TailwindCSS for layout and design.

Approve button: green, Unapprove: red.

Cards: rounded corners, shadows, padding.

Responsive: grid layout adapts for desktop and mobile.

Book Your Stay card: fixed scroll behavior, stops above footer.

Reviews section: widened for better readability, positioned exactly at bottom.

## Data Handling

Mock data (mockdata.ts): reviews + properties.

API routes simulate real endpoints:

/api/reviews/hostaway → fetch reviews.

/api/reviews/approve → toggle approval.

In-memory store tracks approval state.

## Deployment

Deployed via Vercel.

Built with npm run build.

Works in production with live API routes.

## AI Usage

Used ChatGPT for:

Debugging TypeScript errors (dynamic imports, props).

Final implementation tested & adjusted manually.

## Task Sheet Mapping (Checklist)

 Property details (images, amenities, policies)

 Parse & normalize reviews

 Manager dashboard + approve/unapprove

 Per-property insights (avg, count, low-star %)

 Trending properties (≥2 reviews, avg ≥2.5)

 Recurring issues detection + property name

 Toggle “approved only”

 Styling (green approve, red unapprove, card design)

 Deployed to Vercel

 Documentation + AI usage

## Conclusion

This project demonstrates a full stack of UI + review analytics for property management.
It integrates property pages, a functional manager dashboard, analytics (trending & recurring issues), and responsive design — all aligned with the original task sheet requirements.
