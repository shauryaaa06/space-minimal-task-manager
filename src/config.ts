// App-wide feature flags.
//
// Collaboration (shared groups, invite codes, group chat, members, activity feed)
// is currently LOCAL-ONLY — there is no backend that connects real users across
// devices. Until a real server exists, these features are hidden so the App Store
// build ships as a polished single-user task manager. Flip this to `true` once a
// backend is in place to bring all the collaboration UI back.
export const COLLABORATION_ENABLED = false;
