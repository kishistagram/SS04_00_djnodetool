# MVP Scope

## Goal

Build a small but working prototype of a node-based music arrangement tool.

The MVP should demonstrate that users can:

1. See a library of tracks
2. Place tracks on a canvas as nodes
3. Connect nodes with transition edges
4. Define simple transition settings
5. Play a basic sequence between connected tracks
6. Save and load the project structure

## MVP Features

### 1. Track Library

The app should show a list of available tracks.

Each track should have:

- title
- artist
- optional BPM
- optional duration
- optional tags
- optional audio file URL

For the first version, mock tracks are acceptable.

### 2. Canvas

The app should provide a free-form canvas area.

Users should be able to see track nodes positioned on the canvas.

Each node should display:

- track title
- artist, if available
- simple visual styling

### 3. Track Nodes

A track node represents the placement of a track on the canvas.

The same track may eventually appear multiple times, but for the first version, one track can correspond to one node.

Each node should have:

- id
- trackId
- x position
- y position
- label
- optional color

### 4. Transition Edges

Users should be able to connect two nodes.

An edge represents a transition from one track to another.

Each edge should have:

- id
- fromNodeId
- toNodeId
- transitionType
- fadeDurationSec
- optional note

Supported transition types for MVP:

- cut
- fade
- crossfade

### 5. Playback

The first playback system should be simple.

MVP playback should support:

- play one selected track
- stop playback
- play from one node to the next connected node
- apply simple fade or crossfade using fadeDurationSec

The MVP does not need accurate DJ beat matching.

### 6. Project Save/Load

The project should be serializable as JSON.

The user should be able to export and import the project structure.

The saved data should include:

- tracks
- nodes
- edges
- project title
- project id

## Explicitly Out of Scope

Do not implement these features in the MVP:

- Spotify integration
- Suno integration
- Apple Music integration
- YouTube integration
- AI editing
- natural language editing
- automatic BPM detection
- beat matching
- pitch shifting
- time stretching
- waveform editing
- user accounts
- backend server
- cloud sync
- public sharing
- commercial music licensing
- payments
- mobile support
- real-time collaboration

## Technical Scope

The first version should be a frontend-only web application.

Recommended stack:

- React
- TypeScript
- local mock data
- local audio files or sample audio URLs
- JSON import/export

Backend should not be added unless explicitly requested.

## Success Criteria

The MVP is successful if:

- The user can understand the product concept immediately
- The user can see music as a node graph
- The user can connect tracks visually
- The user can play a simple transition
- The project structure is saved as clean JSON
- The implementation is small enough to understand and modify

## Non-goals

The MVP is not intended to be:

- a complete DJ tool
- a commercial music platform
- a Spotify replacement
- a professional DAW
- an AI music generator
- a social music network

The MVP is a prototype for validating the core interaction model.