# Facebook Page

Everything needed to open the Sweet Hand Facebook Page and make its first two
posts. Opening the Page needs the Facebook account that will own it, so a person
does that; this folder holds the art, the copy and the settings.

| File | Purpose |
| --- | --- |
| `page-avatar.png` | Profile picture, 1080 × 1080 px. Facebook shows it as a circle (170 px on desktop, 128 px on phones); the mark sits inside the circle on a full stone tile. |
| `page-cover.png` | Cover photo, 1640 × 720 px. Desktop shows the middle 1640 × 624 strip, phones the central 1280 × 720, so all copy sits in the 1280 × 624 px area both show. |
| `post-1-eaters.png`, `post-2-makers.png` | Feed images, 1080 × 1080 px, the flyer's copy: eaters first, makers second. |
| `reconnecting.md` | Messages for reaching people you have not talked to in years who might cook, know cooks or help, with follow-ups and a call plan. |
| `page.html` | Source for the four images. Open in a browser to preview with the cover's desktop strip and phone crop shaded and the avatar's circle crop outlined. |

Regenerate the images with `node docs/marketing/render.mjs --only facebook` (see
[the marketing README](../README.md#regenerating)). The renderer fails if an
image is not the size above.

## The Page

| Setting | Value |
| --- | --- |
| Name | Sweet Hand |
| Category | Food & Drink |
| Bio | `Find the Caribbean home cooks and small-batch food makers of Toronto and the GTA. Opening soon.` (Facebook allows 101 characters) |
| Website | `https://sweethand.ca` |
| Email | `hello@sweethand.ca` (the production mailbox in `docs/operations/`) |
| Location | Toronto, Ontario. No street address: the Page is for a platform, and no maker's home is involved. |
| Phone | None |
| Hours | None |
| Username | `sweethand`, or `sweethandtoronto` to match the YouTube handle if that is taken. Facebook does not offer a username to a brand-new Page; check **Settings → Page setup** again once the Page has a few posts and followers. |
| Action button | "Sign up" linking to `https://sweethand.ca` |

The About text is the YouTube channel description in
[`../youtube/README.md`](../youtube/README.md#the-channel); the Page's bio is
its first sentence, cut to fit.

Wording follows the content rules in
`docs/design-system/foundations/content.html`: never "certified", "inspected"
or "approved kitchen".

## First posts

Post them in this order, a day apart. Each is one image and a short caption;
Facebook makes a typed URL tappable, but not text in an image.

**1 · For eaters**, with `post-1-eaters.png`:

```text
Someone in Toronto has a sweet hand, and you're about to find them.

Sweet Hand is a new place to find the Caribbean home cooks and small-batch food makers of Toronto and the GTA: Jamaican, Trinidadian, Guyanese, Barbadian, Haitian, Grenadian and more, by dish, island and area.

Opening soon. Join the launch list at https://sweethand.ca and we'll email you once, on launch day.
```

**2 · For makers**, with `post-2-makers.png`:

```text
Cook from home or cater small events in Toronto or the GTA? Let Toronto find you.

On launch day you get your own page on Sweet Hand: your photos, your menu, the islands you cook from and the areas you serve. Listing is free, there are no fees, and we never ask for your home address.

Join the launch list as a caterer at https://sweethand.ca.
```

**3 · The promo video**: share the YouTube link
<https://youtu.be/kJeesMheqQ8> with the makers caption above. Facebook pulls
the title and thumbnail itself.

## Posting

1. Signed in to Facebook, open **Pages → Create** (`facebook.com/pages/create`),
   enter the name, category and bio, and press **Create Page**.
2. In the setup steps, add the website and email, set the city to Toronto,
   Ontario, and upload `page-avatar.png` as the profile picture and
   `page-cover.png` as the cover. Check the cover on a phone: the wordmark,
   tagline and URL must all show.
3. Add the "Sign up" action button pointing at `https://sweethand.ca`.
4. In **Settings → Page setup**, set the username above once Facebook offers it.
5. Make the first two posts, then share the promo video.
6. Record the Page URL here, under a **Published** heading, in the PR that
   follows.

## Published

| What | Where |
| --- | --- |
| Page | <https://www.facebook.com/profile.php?id=61595065212396>, opened 12 October 2026 with the profile picture, cover, bio, website, email, Toronto as the city and the "Sign up" button |

Still to do on the Page: the first two posts and the promo video share (above),
and the username once Facebook offers one.
