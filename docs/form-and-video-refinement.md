# Form and video refinement

The final enquiry section now uses a two-step brief with visible labels, theme choices, optional audience controls and preserved draft values. The account dialog has consistent typography, a Google entry point, email/password fields, a password visibility toggle, accessible error feedback, disabled/loading states, focus trapping and Escape-to-close behavior.

All existing plan prices and authentication providers remain in place. Closing an account dialog cancels the pending submission, and password fields are cleared when the dialog closes. Request confirmation now depends on at least one destination confirming receipt; unsuccessful delivery retains the brief and reports an error.

The video control strip (range, category links and captions) has been removed. Only an accessible still-image toggle remains over the image. Clips use Blob URLs so seeking also works on servers without byte-range support. Object URLs and pending fetches are cleaned up on unmount.

Sticky fix: the legacy stylesheet applied overflow-x:hidden to mobile sections, html and body, creating unintended scroll containers. Horizontal clipping now uses overflow:clip; the hero's ancestors remain visible. The stage sits below the fixed header and releases at the end of the product sequence.

Skills reviewed: scroll-world, remotion-interactivity, remotion-upgrade, design-taste-frontend. This is a Vite/React page with no Remotion packages or timeline compositions. No Remotion upgrade or new paid video generation was necessary. Existing user-supplied footage and extracted stills were used.

References: Aesop account https://sa.aesop.com/account/login and Linear login documentation https://linear.app/docs/login-methods. Applied principles: restrained typography, clearly separated provider/email entry, visible form labels, progressive disclosure and quiet validation. No assets copied.
