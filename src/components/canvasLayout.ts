// Shared canvas layout constants.
//
// Node size is fixed for the MVP so that edges can compute the center
// point of each node when drawing lines between them. Both TrackNode
// (for rendering) and EdgeView (for line geometry) read these values.

export const NODE_WIDTH = 140;
export const NODE_HEIGHT = 60;
