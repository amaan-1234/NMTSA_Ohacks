# NMTSA Learning Management System - Design Guidelines

## Design Approach
**Selected Approach:** Design System + Professional LMS Reference
- **Primary Inspiration:** Canvas LMS, Coursera, and LinkedIn Learning for established educational patterns
- **Design System:** Material Design principles adapted for healthcare/education context
- **Rationale:** Healthcare professionals require clarity, trust, and efficiency. The platform must feel authoritative yet accessible for both medical professionals and families.

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary (Trust Blue): 210 95% 45% - Professional medical blue conveying credibility
- Primary Hover: 210 95% 38%
- Secondary (Accent): 165 70% 45% - Calming teal for secondary actions
- Success (Course Complete): 142 76% 36%
- Warning (In Progress): 38 92% 50%
- Error: 0 84% 60%
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text Primary: 220 13% 18%
- Text Secondary: 220 9% 46%

**Dark Mode:**
- Primary: 210 85% 60%
- Primary Hover: 210 85% 68%
- Secondary: 165 60% 55%
- Success: 142 69% 48%
- Warning: 38 92% 60%
- Error: 0 72% 65%
- Background: 220 18% 12%
- Surface: 220 15% 16%
- Text Primary: 0 0% 95%
- Text Secondary: 220 9% 70%

### B. Typography
- **Primary Font:** 'Inter' (Google Fonts) - Clean, professional, excellent readability
- **Headings:** 'Poppins' (Google Fonts) - Friendly yet authoritative
- **Code/Certificates:** 'Roboto Mono' for certificate numbers and technical data
- **Scale:** 
  - Hero/Display: text-5xl to text-6xl font-bold
  - Page Headings: text-3xl to text-4xl font-semibold
  - Section Titles: text-2xl font-semibold
  - Card Titles: text-xl font-semibold
  - Body: text-base leading-relaxed
  - Small/Meta: text-sm text-secondary

### C. Layout System
- **Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24 (consistent rhythm)
- **Container:** max-w-7xl mx-auto px-4 for main content areas
- **Sidebar Width:** w-64 for navigation (lg:w-72 on larger screens)
- **Card Padding:** p-6 standard, p-8 for featured content
- **Section Spacing:** py-12 to py-20 between major sections
- **Grid Gaps:** gap-6 for cards, gap-4 for lists

### D. Component Library

**Navigation:**
- Fixed top navbar: Dark surface with white text, height h-16
- Sidebar navigation for dashboard: Collapsible on mobile, persistent on desktop
- Breadcrumb trail for course navigation
- Tabbed navigation within courses (Overview, Content, Discussions, Resources)

**Course Cards:**
- Elevated cards with hover lift effect (shadow-lg hover:shadow-xl)
- Course thumbnail image (16:9 aspect ratio)
- Progress bar at bottom for enrolled courses
- Badge indicators for "New", "Premium", "CE Credits"
- Clear CTA buttons (primary for enrolled, outline for browse)

**Video Player:**
- Custom controls with progress tracking
- Playback speed options
- Closed caption support
- Fullscreen capability
- Lesson navigation sidebar

**Forms & Inputs:**
- High contrast borders (border-2) for accessibility
- Clear focus states with ring-2 ring-primary
- Helper text and validation messages
- Dark mode compatible inputs with proper backgrounds

**Certificates:**
- Professional bordered design with NMTSA branding
- Certificate number with monospace font
- QR code for verification
- Downloadable as PDF

**Discussion Forums:**
- Threaded comment structure
- User avatars with role badges (Professional/Family/Admin)
- Rich text editor for formatting
- Vote/helpful indicators

**Data Displays:**
- Progress circles for course completion
- Stats dashboard with icon+number+label cards
- Timeline view for learning path
- Achievement badges gallery

**Overlays:**
- Modal dialogs for enrollment/payment (backdrop blur)
- Toast notifications for actions (top-right positioning)
- Dropdown menus with smooth transitions
- Sidebar panel for resource downloads

### E. Animations
Use sparingly and purposefully:
- Card hover: translate-y-[-4px] transition-transform duration-200
- Button press: Active state scale-[0.98]
- Page transitions: Fade-in for route changes
- Progress bar: Smooth width animation over 300ms
- No decorative animations - focus on functional feedback

## Page-Specific Guidelines

### Landing Page
**Hero Section:**
- Large hero image showing healthcare professional engaging with patient/family (warm, professional photography)
- Headline: "Professional Education for Neurologic Music Therapy" 
- Two-CTA approach: "Browse Courses" (primary) + "Learn More" (outline with backdrop-blur)
- Trust indicators: "AMTA Approved" + "500+ Certified Professionals"

**Feature Sections:**
- Three-column grid showcasing: CE Credits, Expert-Led Courses, Flexible Learning
- Icons from Heroicons (academic-cap, shield-check, device-mobile)
- Each feature with icon, title, description

**Course Preview:**
- Horizontal scroll carousel of featured courses
- 4 courses visible on desktop, swipeable on mobile

**Testimonials:**
- Two-column layout with professional headshots
- Role badges (Music Therapist, Family Member)
- Brief, impactful quotes

**Footer:**
- Four-column layout: Courses, Resources, Support, Connect
- Newsletter signup with email input
- Social links, AMTA certification badge
- Copyright and accessibility statement

### Dashboard (Student View)
**Layout:** Sidebar + Main Content
- Left sidebar: Navigation (My Courses, Browse, Certificates, Forums, Settings)
- Main area: Welcome header with progress summary
- "Continue Learning" section with current course cards
- "Recommended for You" based on interests
- Quick stats: Total hours, Certificates earned, Courses completed

### Course Detail Page
**Structure:**
- Course header with thumbnail, title, instructor, rating, CE credits
- Tabbed content area (sticky tabs)
- Sidebar: Lesson list with checkmarks, downloadable resources
- Enrollment card (sticky): Price, enroll button, what's included
- Discussion section at bottom with forum threads

### Admin Panel
**Dashboard Style:**
- Dark sidebar with light content area
- Data visualization: Charts for enrollments, completions, revenue
- Table views for user management and course analytics
- Action-oriented layout with clear CTAs

## Images

**Hero Image:**
- Large, high-quality photograph (1920x800px minimum)
- Shows music therapist with patient in professional setting
- Warm, inviting atmosphere with natural lighting
- Positioned: bg-cover bg-center with overlay gradient

**Course Thumbnails:**
- Professional photography or relevant illustrations
- 16:9 aspect ratio (400x225px)
- Consistent visual style across all courses

**Instructor Photos:**
- Professional headshots (200x200px)
- Circular crop for consistency
- Used in course headers and about sections

**Certificate Background:**
- Subtle texture or watermark
- NMTSA logo placement
- Border design element

This design creates a trustworthy, professional learning environment that serves both healthcare professionals seeking CE credits and families looking for educational support, with clear visual hierarchy and accessible patterns throughout.