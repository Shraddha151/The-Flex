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

**About this property – description.**

**Amenities – shown in bordered chips (Internet, Kitchen, Smoke Detector, etc).**

**Stay Policies – check-in/out, house rules, cancellation policies.**

**Book Your Stay card – select dates, number of guests, inquiry/availability check.**

**Reviews Section:**

Rendered at the bottom of the page.

Uses wider width, spanning the same space as About + Inquiry combined.

Only approved reviews appear for the current property.

Includes category scores, filters, histograms, highlights, and keyword chips (when reviews come up with all these categories marked, these will automatically light up).

**Location & Map (Not Implemented)**  
- The original Flex Living website includes a **Google Maps embed**.  
- Implementing this requires the **Google Maps JavaScript API** or **Places API**, which needs billing and a valid Google API key.  
- Since this project is designed for mock data only, the **map section was not implemented**.  
- 👉 Instead, the **Reviews Section** was placed at the same position.  
- In a real production build, the **Location (map)** would appear first, followed by the **Reviews Section**.  

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
Live production link:  https://the-flex-3ipm.vercel.app
API endpoint: https://the-flex-3ipm.vercel.app/api/reviews/hostaway

Built with npm run build.

Works in production with live API routes.

---

## Google Reviews (Exploration)
Google Reviews integration was explored through the **Google Places API** (Places Details endpoint). It is feasible to fetch reviews for a property by its Place ID and normalize them into the same format as Hostaway reviews (`id`, `propertyId`, `propertyName`, `rating`, `submittedAt`, `text`, `guestName`).  

However, this requires an active Google Cloud project, billing enabled, and a valid API key. Since the assessment scope provided only mocked Hostaway data and no Google API credentials, full integration was not implemented.  

If expanded in production, the approach would be:  
1. Use Google Places API → `place/details` endpoint.  
2. Extract `reviews[]`.  
3. Normalize reviews to internal `Review` type.  
4. Merge with Hostaway reviews for manager analysis.  


## AI Usage

Used ChatGPT for:

Debugging TypeScript errors (dynamic imports, props).

Final implementation was tested & adjusted manually.

## Task Sheet Mapping (Checklist)

 Property details (images, amenities, policies)✅

 Parse & normalize reviews✅

 Manager dashboard + approve/unapprove✅

 Per-property insights (avg, count, low-star %)✅

 Trending properties (≥2 reviews, avg ≥2.5)✅

 Recurring issues detection + property name✅

 Toggle “approved only”✅

 Styling (green approve, red unapprove, card design)✅

 Deployed to Vercel✅

 Google Reviews Exploration✅

 Documentation + AI usage✅

## Conclusion

This project demonstrates a full stack of UI + review analytics for property management.
It integrates property pages, a functional manager dashboard, analytics (trending & recurring issues), and responsive design — all aligned with the original task sheet requirements.


