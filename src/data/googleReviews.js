// Google Review content for the homepage customer reviews carousel.
//
// These are the current working reviews (Roman English) provided by FSD Home
// Services. The data is isolated here so it can be swapped for live Google
// review data later (e.g. via the Google Places / fetch-google-reviews edge
// function) without touching the carousel UI.
//
// Fields:
//   id      — unique key
//   name    — customer name
//   service — service used
//   area    — customer area
//   rating  — 1–5 star rating
//   text    — actual review text (strictly as provided; do not invent)

export const googleReviews = [
  {
    id: 'review-1',
    name: 'Muhammad Usman',
    service: 'AC Repair',
    area: 'Madina Town, Faisalabad',
    rating: 5,
    text: 'AC ka issue tha aur technician time par aa gaya. Problem properly check ki aur jaldi fix kar di. Overall service ka experience acha raha.'
  },
  {
    id: 'review-2',
    name: 'Ahmed Raza',
    service: 'Electrical Work',
    area: 'D-Ground, Faisalabad',
    rating: 5,
    text: 'Ghar mein wiring ka issue tha. Electrician ne properly check karke problem explain ki aur kaam bhi jaldi complete kar diya. Service achi lagi.'
  },
  {
    id: 'review-3',
    name: 'Ali Hassan',
    service: 'Plumbing',
    area: 'Peoples Colony, Faisalabad',
    rating: 5,
    text: 'Bathroom mein leakage ka issue tha. Plumber same day aa gaya aur problem properly fix kar di. Booking ka process bhi kaafi easy tha.'
  },
  {
    id: 'review-4',
    name: 'Hamza',
    service: 'AC Installation',
    area: 'Canal Road, Faisalabad',
    rating: 4,
    text: 'AC installation ke liye service book ki thi. Technician cooperative tha aur installation neatly complete ki. Overall good experience.'
  },
  {
    id: 'review-5',
    name: 'Usman Ahmed',
    service: 'Carpentry',
    area: 'Satiana Road, Faisalabad',
    rating: 5,
    text: 'Ghar mein carpentry ka kaam tha aur reliable worker chahiye tha. FSD Home Services se worker mila aur kaam achi tarah complete hua.'
  },
  {
    id: 'review-6',
    name: 'Bilal',
    service: 'Painting',
    area: 'Gulberg, Faisalabad',
    rating: 5,
    text: 'Ghar ke painting work ke liye painter book kiya. Worker time par aya aur finishing bhi achi thi. Service se satisfied hoon.'
  }
];