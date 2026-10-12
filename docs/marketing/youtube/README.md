# YouTube channel

Everything needed to open the Sweet Hand YouTube channel and post the promo video
[05 · Cater with Sweet Hand](../../videos/05-cater-with-sweet-hand/README.md).
Opening the channel and uploading need the Google account that will own the
channel, so a person does those steps; this folder holds the art, the copy and
the settings so that takes ten minutes, not an afternoon.

| File | Purpose |
| --- | --- |
| `channel-avatar.png` | Profile picture, 800 × 800 px. YouTube crops it to a circle; the bowl sits inside the circle on a full pepper tile. |
| `channel-banner.png` | Channel banner, 2560 × 1440 px. All copy sits in the 1546 × 423 px safe area that every device shows. |
| `thumbnail-05-cater-with-sweet-hand.png` | Thumbnail for the promo video, 1280 × 720 px. |
| `05-cater-with-sweet-hand.en-CA.srt` | Closed captions for the promo video, English (Canada). |
| `channel.html` | Source for the three images. Open in a browser to preview with the banner safe area and the avatar's circle crop shaded. |

Regenerate the images with `node docs/marketing/render.mjs --only youtube` (see
[the marketing README](../README.md#regenerating)). The renderer fails if an
image is not the size above or over YouTube's file limit (4 MB avatar, 6 MB
banner, 2 MB thumbnail).

## The channel

| Setting | Value |
| --- | --- |
| Name | Sweet Hand |
| Handle | `@sweethandca` (fallbacks, in order: `@sweethand`, `@sweethand.ca`) |
| Description | See below (under 1,000 characters) |
| Links | `https://sweethand.ca` titled "Join the launch list"; `https://github.com/QuinntyneBrown/sweet-hand` titled "Open source on GitHub" |
| Contact email | `hello@sweethand.ca` (the production mailbox in `docs/operations/`) |
| Country | Canada |
| Keywords | `"Sweet Hand" "Caribbean food" "Caribbean caterer" Toronto GTA Jamaican Trinidadian Guyanese Barbadian "home cooks" "small batch" roti doubles jerk oxtail pelau "black cake"` |
| Upload defaults | Visibility Public · Category Howto & Style · Language English (Canada) · Licence Standard YouTube · Not made for kids · Comments on, hold potentially inappropriate comments for review |

Channel description:

> Sweet Hand is a place to find the Caribbean home cooks and small-batch food makers of Toronto and the GTA: Jamaican, Trinidadian, Guyanese, Barbadian, Haitian, Grenadian and more, by dish, island tradition, area and occasion.
>
> Caterers get their own page with their photos, menu, the islands they cook from and the areas they serve. Home addresses stay private. Listing is free and there are no fees.
>
> Opening soon. Join the launch list at sweethand.ca.
>
> The name comes from the Caribbean saying that someone has a sweet hand: their cooking is just that good.

Wording follows the content rules in
`docs/design-system/foundations/content.html`: never "certified", "inspected"
or "approved kitchen"; the food handler certificate is the caterer's own
statement.

## The video

| Setting | Value |
| --- | --- |
| File | `docs/videos/05-cater-with-sweet-hand/05-cater-with-sweet-hand.mp4` (1920 × 1080, H.264 + AAC, 30 fps, 1:19, 3.8 MB) |
| Title | `Cater with Sweet Hand: Caribbean home cooks, be found in Toronto and the GTA` |
| Thumbnail | `thumbnail-05-cater-with-sweet-hand.png` (custom thumbnails need a phone-verified channel) |
| Captions | `05-cater-with-sweet-hand.en-CA.srt`, language English (Canada). The cues are timed from the run sheet, so if a line lands early or late, use YouTube's **Auto-sync** with the plain text of `script.md` instead. |
| Playlist | "For caterers" (create it on first upload) |
| Audience | No, it's not made for kids |
| Altered content | No. The narration is a synthesized voice, but the video shows no real person or event, which is what YouTube's disclosure is for. |
| Category | Howto & Style |
| Language | English (Canada) |
| Tags | `Sweet Hand, Caribbean caterer Toronto, Caribbean food Toronto, Caribbean catering GTA, Jamaican food Toronto, Trinidadian food Toronto, Guyanese food Toronto, Bajan food Toronto, home cook, small batch, roti, doubles, jerk, oxtail, pelau, black cake, Scarborough, Brampton, Mississauga, Ajax, Pickering, caterer launch list` |
| Visibility | Public. Upload as Unlisted first if someone wants to check playback and captions before it goes out. |

Description (chapters need the first stamp at `00:00` and at least three
stamps, which this has):

```text
Everybody asks who made the pelau. Sweet Hand is a new place for Caribbean home cooks and small caterers in Toronto and the GTA to be found: Jamaican, Trini, Guyanese, Bajan and more, all in one place.

On launch day you get your own page: your photos, your menu, the islands you cook from, the areas you serve and the size of event you take on. People browse by island, area and occasion, send an enquiry with their date and guest count, and you agree the details directly with them. Listing is free, and there are no fees. We never ask for your home address.

To be listed you'll need a food handler certificate, and our team checks every page before it goes live.

Be there on day one: go to https://sweethand.ca and press Join as a caterer. We'll email you once, on launch day.

Chapters
00:00 Word of mouth
00:14 One place to be found
00:28 Your own page
00:42 How it works
00:57 Be there on day one

Sweet Hand is open source: https://github.com/QuinntyneBrown/sweet-hand
The caterers shown are a fictional preview cast, not real businesses.

#Toronto #CaribbeanFood #Caterer #GTA #Jamaican #Trini #Guyanese #Bajan
```

Pinned comment, posted right after publishing:

```text
Cook from home or cater small events in Toronto or the GTA? Join the launch list as a caterer at https://sweethand.ca. Listing is free, there are no fees, and we never ask for your home address.
```

## Posting

Use the Google account that should own the channel. A channel made as a
"brand account" can have several managers, so prefer that over a personal
channel.

1. Sign in to YouTube, open **Settings → Add or manage your channel(s) →
   Create a channel**, name it **Sweet Hand** and accept the handle
   `@sweethandca` (or the next fallback above).
2. In **YouTube Studio → Customization → Branding**, upload
   `channel-avatar.png` as the picture and `channel-banner.png` as the banner.
   Check the banner preview on phone, desktop and TV: the wordmark, tagline and
   URL must show on all three.
3. In **Customization → Basic info**, paste the channel description, add the
   two links and the contact email.
4. In **Settings → Channel → Basic info**, set the country to Canada and paste
   the keywords. In **Settings → Upload defaults**, set the defaults above.
   Under **Feature eligibility**, verify a phone number so custom thumbnails
   are allowed.
5. **Create → Upload videos**, choose the MP4, then enter the title,
   description, thumbnail, playlist, audience, altered-content answer, tags,
   language and category from the table. Under **Subtitles**, upload the SRT
   (or Auto-sync the script). Set visibility to Public and publish.
6. Post the pinned comment and pin it (the three dots on the comment → Pin).
7. Record the channel and video URLs here, under a **Published** heading, in
   the PR that follows.

Embedding the video on the launch page is a product change: it needs L1/L2
requirements, a detailed design and a mock first (see `AGENTS.md`).
