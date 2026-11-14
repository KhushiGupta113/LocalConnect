LocalConnect 🏡

Your Neighborhood, Connected.

LocalConnect is a community networking mobile application designed to bring neighborhoods closer together. It enables residents to discover nearby communities, share local updates, create posts, participate in events and interact with their neighbors.

Built as a cross-platform mobile application using React Native, Expo and TypeScript.

📱 Features

Community Feed

Browse posts from your neighborhood.

Search and filter posts by category.

Like, bookmark and share posts.

Hide posts from your feed.

Discover

Explore nearby communities and groups.

Discover local activities and events.

Join communities and RSVP to activities.

Create Posts

Publish community updates.

Attach multiple images.

Select categories and locations.

Create polls and mark urgent posts.

Notifications

Receive activity notifications.

Track likes, comments and community updates.

Mark notifications as read.

User Profiles

View and edit personal profiles.

Manage profile information and privacy settings.

View created and saved posts.

Track community activity.

Post Details

View complete posts.

Like and bookmark posts.

Add comments and replies.

🛠️ Tech Stack

Mobile Development

React Native

Expo

TypeScript

React Navigation

Backend

Node.js

Express.js

MongoDB

Mongoose

Development Tools

Git

GitHub

Google Stitch

Antigravity

📂 Project Structure

LocalConnect/
│
├── assets/             # Application assets
├── src/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   └── types/
│
├── backend/            # Backend application
│   └── src/
│
├── stitch/             # Original UI design references
│
├── App.tsx
├── app.json
├── eas.json
├── package.json
└── tsconfig.json

🚀 Getting Started

Prerequisites

Node.js

npm

Expo Go on an Android device

Git

Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/LocalConnect.git

Navigate to the project:

cd LocalConnect

Install dependencies:

npm install

Start the Expo development server:

npm start

Scan the QR code using Expo Go to run the application on your Android device.

TypeScript Validation

npm run typecheck

🏗️ Android Build

The project uses Expo Application Services (EAS) for Android builds.

Configure EAS:

eas build:configure

Generate an Android APK:

eas build --platform android --profile preview

🗺️ Development Roadmap

React Native project setup

Stitch-based mobile UI implementation

Authentication screens

Home feed and navigation

Discover and community screens

Post creation and interactions

Notifications and profile management

Post details and comments

Complete backend integration

Persistent authentication and database storage

End-to-end testing

Production deployment

🎯 Project Objective

LocalConnect aims to make neighborhood communication more accessible by providing a dedicated digital space for residents to connect, share information and participate in local communities.

Built with ❤️ using React Native and Expo
