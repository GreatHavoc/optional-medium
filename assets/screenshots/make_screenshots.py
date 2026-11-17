"""Two 1280x800 AMO store screenshots for Optional Medium.

Pillow composites the real icon + popup mockup; no external assets.
"""
from PIL import Image, ImageDraw, ImageFont

OUT = r"C:\Users\Prakhar\Desktop\Medium Optional\assets\screenshots"
ICON = r"C:\Users\Prakhar\Desktop\Medium Optional\medium-to-freedium\icon128.png"

W, H = 1280, 800
BG = (20, 22, 26)
CARD = (38, 42, 49)
INK = (245, 247, 250)
MUTED = (154, 164, 178)
GREEN = (52, 211, 153)
LINE = (58, 64, 72)

B = "C:/Windows/Fonts/segoeuib.ttf"
R = "C:/Windows/Fonts/segoeui.ttf"
M = "C:/Windows/Fonts/consola.ttf"


def fit(draw, text, font_path, size, max_w, min_size=20):
    while size > min_size:
        f = ImageFont.truetype(font_path, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 2
    return ImageFont.truetype(font_path, min_size)


def rrect(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def chip(d, x, y, text, font, pad=(18, 12), fill=None, color=None, r=12):
    w = int(d.textlength(text, font=font) + pad[0] * 2)
    h = font.size + pad[1] * 2
    rrect(d, (x, y, x + w, y + h), r, fill=fill, outline=LINE, width=1)
    d.text((x + pad[0], y + pad[1] - 2), text, font=font, fill=color or INK)
    return w


def base():
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)


# ---------------------------------------------------------------- screenshot 1
img, d = base()
icon = Image.open(ICON).convert("RGBA").resize((300, 300), Image.LANCZOS)
img.paste(icon, (96, 110), icon)

tx = 470
avail = W - tx - 96
f_head = fit(d, "Medium links open on Freedium.", B, 66, avail)
d.text((tx, 168), "Medium links open on Freedium.", font=f_head, fill=INK)
f_sub = ImageFont.truetype(R, 36)
d.text((tx, 168 + f_head.size + 34), "The site itself becomes optional.",
       font=f_sub, fill=MUTED)

d.line((tx, 320, tx + 120, 320), fill=GREEN, width=6)
d.text((tx, 350), "Click, paste or type any Medium link.", font=ImageFont.truetype(R, 32), fill=INK)
d.text((tx, 396), "The article opens exactly as the author wrote it.", font=ImageFont.truetype(R, 32), fill=MUTED)

# redirect strip: two stacked rows so the mirror URL never overflows
f_mono = ImageFont.truetype(M, 24)
rrect(d, (96, 540, W - 96, 700), 18, fill=CARD)
d.text((130, 496), "WHAT THE ADDRESS BAR DOES", font=ImageFont.truetype(B, 22), fill=MUTED)
d.text((130, 566), "https://medium.com/@user/12-rules-for-opus-5-5", font=f_mono, fill=MUTED)
d.text((130, 606), "v", font=ImageFont.truetype(B, 26), fill=GREEN)
d.text((130, 644), "https://freedium-mirror.cfd/https://medium.com/@user/12-rules-for-opus-5-5", font=f_mono, fill=GREEN)
d.text((130, 730), "No paywall. No login. No truncated member-only post.", font=ImageFont.truetype(R, 30), fill=INK)
img.save(OUT + "/screenshot-1.png", optimize=True)
print("screenshot-1.png")

# ---------------------------------------------------------------- screenshot 2
img, d = base()
f_h = fit(d, "Set it once. Forget it.", B, 62, W - 160)
d.text((80, 64), "Set it once. Forget it.", font=f_h, fill=INK)
d.line((80, 64 + f_h.size + 26, 200, 64 + f_h.size + 26), fill=GREEN, width=6)

# --- popup mock ---
px, py, pw, ph = 80, 200, 420, 520
rrect(d, (px, py, px + pw, py + ph), 20, fill=(250, 250, 252))
d.rectangle((px, py, px + pw, py + 66), fill=(238, 240, 244))
d.text((px + 24, py + 22), "Optional Medium", font=ImageFont.truetype(B, 24), fill=INK)

cy = py + 100
rrect(d, (px + 24, cy, px + 54, cy + 30), 6, fill=GREEN)
d.line((px + 31, cy + 16, px + 39, cy + 25, px + 48, cy + 8), fill=(255, 255, 255), width=4, joint="curve")
d.text((px + 70, cy + 2), "Redirect Medium links", font=ImageFont.truetype(R, 26), fill=INK)

d.text((px + 24, cy + 56), "Mirror domain", font=ImageFont.truetype(R, 22), fill=MUTED)
rrect(d, (px + 24, cy + 90, px + pw - 24, cy + 138), 10, fill=(255, 255, 255), outline=LINE)
d.text((px + 40, cy + 102), "freedium-mirror.cfd", font=ImageFont.truetype(M, 24), fill=INK)

d.text((px + 24, cy + 168), "Extra custom domains", font=ImageFont.truetype(R, 22), fill=MUTED)
rrect(d, (px + 24, cy + 202, px + pw - 24, cy + 290), 10, fill=(255, 255, 255), outline=LINE)
d.text((px + 40, cy + 216), "blog.vijayasekhardeepak.com", font=ImageFont.truetype(M, 22), fill=MUTED)

rrect(d, (px + 24, cy + 320, px + 150, cy + 372), 8, fill=GREEN)
d.text((px + 52, cy + 332), "Save", font=ImageFont.truetype(B, 26), fill=(6, 40, 30))
d.text((px + 24, cy + 400), "Mirror dies? Paste the new one. Done.", font=ImageFont.truetype(R, 22), fill=MUTED)

# --- feature rows ---
rx = 560
rw = W - rx - 80
items = [
    ("Every kind of link", "medium.com, @author publications, subdomains, custom blogs"),
    ("Nothing to configure", "It redirects the moment you install it"),
    ("Escape hatch", "The mirror's own \"open original\" button still works"),
    ("Your settings, three fields", "On off switch, mirror domain, extra domains"),
    ("Private", "No data collected, no accounts, open source"),
]
y = 200
for title, sub in items:
    rrect(d, (rx, y, rx + 34, y + 34), 8, fill=GREEN)
    d.line((rx + 9, y + 18, rx + 16, y + 26, rx + 27, y + 11), fill=(6, 40, 30), width=4, joint="curve")
    d.text((rx + 56, y - 2), title, font=ImageFont.truetype(B, 30), fill=INK)
    d.text((rx + 56, y + 36), sub, font=ImageFont.truetype(R, 26), fill=MUTED)
    if y < 600:
        d.line((rx, y + 92, rx + rw - 40, y + 92), fill=LINE, width=1)
    y += 112

img.save(OUT + "/screenshot-2.png", optimize=True)
print("screenshot-2.png")