#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quyet Tran Lux (@quyettranlux) v10 — Option 2 Luxury Edition
- Option 2 Motion Graphics: Self-drawing 45° Angled Champagne Gold Leader Lines (o──╱──────)
  with levitating 3D metallic numbers + Feathered Frosted Summary Band (zero oval gauges, zero boxy borders!)
- Authentic iOS Tri-Tone / Glass Chime SMS Notification Sound Effect right at t=0.05s when SMS pops up
- Cohesive Quiet-Luxury Palette: Champagne Gold (#DAB26C), Pearl White (#FCFCFA), Tiffany Mint (#6EE7D7)
- Output: Imperia_Sensa_Park_QuyetTranLux_Option2_Final.mp4
"""

import os
import sys
import math
import time
import subprocess
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import scipy.io.wavfile as wav

WORKSPACE = "/working_dir/c_7281cf7ef3dc590c"
UPLOAD_DIR = f"{WORKSPACE}/user_uploaded_files/ttl=63d/user_uploaded"
INTER_DIR = f"{WORKSPACE}/artifacts/file_generation/ttl=63d/intermediate"
OUT_DIR = f"{WORKSPACE}/artifacts/file_generation/ttl=63d/output"
RAW_OUT_MP4 = f"{INTER_DIR}/raw_option2.mp4"
FINAL_MP4 = f"{OUT_DIR}/Imperia_Sensa_Park_QuyetTranLux_Option2_Final.mp4"

VIDEO_PATH = f"{UPLOAD_DIR}/copy_2107E370-D37A-4645-B0FD-39FE8857188A.mov"
IMG_EARLY_BIRD = f"{UPLOAD_DIR}/image.png"
IMG_SHOW_UNIT = f"{UPLOAD_DIR}/image_2.png"
IMG_AN_CU = f"{UPLOAD_DIR}/image_3.png"
IMG_CAKE_LOGO = f"{UPLOAD_DIR}/image_4.png"
IMG_MIK_LOGO = f"{UPLOAD_DIR}/image_5.png"
IMG_SMS = f"{UPLOAD_DIR}/image_6.png"
IMG_PASSBOOK = f"{UPLOAD_DIR}/image_7.png"

W, H = 1080, 1920
X_SAFE_CENTER = 468

FONT_BLACK = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
FONT_EXTRABOLD = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
FONT_BOLD = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
FONT_SERIF_IT = "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Italic.ttf"
FONT_SERIF_BOLD_IT = "/usr/share/fonts/truetype/noto/NotoSerifDisplay-BoldItalic.ttf"

# Option 2 Quiet-Luxury Palette (RGB)
CHAMPAGNE_LIGHT = (252, 243, 207)   # #FCF3CF
CHAMPAGNE_GOLD = (218, 178, 108)    # #DAB26C
CHAMPAGNE_DEEP = (145, 102, 38)     # #916626
PEARL_WHITE = (252, 252, 250)       # #FCFCFA
SILVER_MIST = (205, 214, 224)       # #CDD6E0
MINT_LUX = (110, 231, 215)          # #6EE7D7
MINT_DEEP = (15, 118, 110)          # #0F766E
OBSIDIAN = (10, 15, 24)

_FONT_CACHE = {}
def get_font(path, size):
    key = (path, int(size))
    if key not in _FONT_CACHE:
        _FONT_CACHE[key] = ImageFont.truetype(path, int(size))
    return _FONT_CACHE[key]

SEGMENTS = [
    (0.12,  2.42, "seg1_sms_point"),
    (2.72,  5.94, "seg2_answer_both"),
    (6.48,  7.18, "seg3_duoc_luon"),
    (8.30,  9.25, "seg4_tin_khong"),
    (9.98, 13.16, "seg5_imperia_ancu"),
    (13.45, 19.52, "seg6_cake_10pct_so"),
    (19.95, 21.96, "seg7_huong_lai"),
    (22.16, 40.94, "seg8_floating_numbers"),
    (41.10, 47.92, "seg9_maturity_handover"),
    (48.72, 49.32, "seg10_con_nua"),
    (50.00, 55.88, "seg11_earlybird_showunit"),
    (56.24, 59.45, "seg12_countdown_urgency"),
    (60.14, 64.78, "seg13_cta_comment"),
    (65.26, 68.40, "seg14_cta_follow"),
]

def rgba_to_bgra(arr_rgba: np.ndarray) -> np.ndarray:
    return arr_rgba[:, :, [2, 1, 0, 3]].copy()

# =========================================================================
# CACHED METALLIC GRADIENT 3D TEXT PATCHES (OPTION 2 QUIET-LUXURY PALETTE)
# =========================================================================
_TEXT_CACHE = {}

def get_luxury_text_patch(
    text: str,
    font_path: str,
    size: int,
    style: str = "gold",  # "gold", "mint", "white", "silver", "serif_gold", "serif_white"
    extrude: int = 4,
    tracking: int = 2,
):
    key = (text, font_path, int(size), style, extrude, tracking)
    if key in _TEXT_CACHE:
        return _TEXT_CACHE[key]

    font = get_font(font_path, size)
    dummy = Image.new("L", (1, 1), 0)
    dd = ImageDraw.Draw(dummy)
    chars = list(text)
    widths = [dd.textlength(c, font=font) for c in chars]
    tw = int(math.ceil(sum(widths) + tracking * max(0, len(chars) - 1)))
    bb = dd.textbbox((0, 0), text, font=font)
    th = bb[3] - bb[1]

    pad = 36
    cw, ch = tw + pad * 2 + extrude, th + pad * 2 + extrude
    tx, ty = pad, pad - bb[1]

    if style == "gold":
        top_rgb, bot_rgb = CHAMPAGNE_LIGHT, CHAMPAGNE_GOLD
        bev_rgb = (48, 32, 12)
    elif style == "mint":
        top_rgb, bot_rgb = PEARL_WHITE, MINT_LUX
        bev_rgb = (10, 52, 48)
    elif style == "silver":
        top_rgb, bot_rgb = SILVER_MIST, (165, 178, 195)
        bev_rgb = (14, 20, 30)
    elif style == "serif_gold":
        top_rgb, bot_rgb = CHAMPAGNE_LIGHT, CHAMPAGNE_GOLD
        bev_rgb = (36, 24, 10)
        extrude = min(extrude, 2)
    elif style == "serif_white":
        top_rgb, bot_rgb = PEARL_WHITE, SILVER_MIST
        bev_rgb = (14, 20, 30)
        extrude = min(extrude, 2)
    else:  # "white"
        top_rgb, bot_rgb = PEARL_WHITE, SILVER_MIST
        bev_rgb = (18, 26, 38)

    layer = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))

    # 1. Soft Gaussian drop shadow
    sh = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    cur_x = float(tx)
    for c, w_c in zip(chars, widths):
        sd.text((int(round(cur_x)) + 3, int(round(ty)) + 6), c, font=font, fill=(0, 0, 0, 215), stroke_width=3, stroke_fill=(0, 0, 0, 215))
        cur_x += w_c + tracking
    sh = sh.filter(ImageFilter.GaussianBlur(radius=9))
    layer = Image.alpha_composite(layer, sh)

    # 2. Crisp dark bevel extrusion
    if extrude > 0:
        ex = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        ed = ImageDraw.Draw(ex)
        for d in range(extrude, 0, -1):
            cur_x = float(tx + d)
            for c, w_c in zip(chars, widths):
                ed.text((int(round(cur_x)), int(round(ty + d))), c, font=font, fill=(*bev_rgb, 245), stroke_width=2, stroke_fill=(8, 12, 20, 245))
                cur_x += w_c + tracking
        cur_x = float(tx)
        for c, w_c in zip(chars, widths):
            ed.text((int(round(cur_x)), int(round(ty))), c, font=font, fill=(8, 12, 20, 255), stroke_width=2, stroke_fill=(8, 12, 20, 255))
            cur_x += w_c + tracking
        layer = Image.alpha_composite(layer, ex)

    # 3. Metallic vertical face gradient
    mask = Image.new("L", (cw, ch), 0)
    md = ImageDraw.Draw(mask)
    cur_x = float(tx)
    for c, w_c in zip(chars, widths):
        md.text((int(round(cur_x)), int(round(ty))), c, font=font, fill=255)
        cur_x += w_c + tracking

    mbbox = mask.getbbox()
    if mbbox:
        by1, by2 = mbbox[1], mbbox[3]
        grad = np.zeros((ch, cw, 4), dtype=np.uint8)
        span = max(1, by2 - by1)
        t_v = np.clip((np.arange(ch, dtype=np.float32) - by1) / span, 0.0, 1.0)[:, None]
        for i in range(3):
            grad[:, :, i] = (top_rgb[i] * (1.0 - t_v) + bot_rgb[i] * t_v).astype(np.uint8)
        grad[:, :, 3] = np.array(mask, dtype=np.uint8)
        layer = Image.alpha_composite(layer, Image.fromarray(grad, mode="RGBA"))

    bgra = rgba_to_bgra(np.array(layer, dtype=np.uint8))
    res = (bgra, -cw // 2, -ch // 2)
    _TEXT_CACHE[key] = res
    return res

def blend_bgra_onto_bgr(
    frame_bgr: np.ndarray,
    patch_info: tuple,
    cx: int,
    cy: int,
    local_t: float = 1.0,
    start_t: float = 0.0,
    dur_in: float = 0.28,
    mode: str = "scale_pop",
    bob_dx: float = 0.0,
    bob_dy: float = 0.0,
):
    if local_t < start_t:
        return
    patch, ox, oy = patch_info
    ph, pw = patch.shape[:2]
    p = min(1.0, (local_t - start_t) / max(0.04, dur_in))
    ease = 1.0 - (1.0 - p) ** 3

    if p >= 0.999:
        cur = patch
    elif mode == "scale_pop":
        scale = 1.18 - 0.18 * ease
        nw, nh = max(2, int(round(pw * scale))), max(2, int(round(ph * scale)))
        resized = cv2.resize(patch, (nw, nh), interpolation=cv2.INTER_LINEAR)
        k = max(1, int(round((1.0 - ease) * 11)) | 1)
        if k > 1:
            resized = cv2.blur(resized, (k, 1))
        resized[:, :, 3] = (resized[:, :, 3].astype(np.float32) * min(1.0, p * 1.4)).astype(np.uint8)
        cur = resized
        ox, oy = -nw // 2, -nh // 2
        ph, pw = nh, nw
    else:  # "slide_up"
        cur = patch.copy()
        bob_dy += (1.0 - ease) * 22.0
        cur[:, :, 3] = (cur[:, :, 3].astype(np.float32) * ease).astype(np.uint8)

    x1 = int(round(cx + bob_dx)) + ox
    y1 = int(round(cy + bob_dy)) + oy
    x2, y2 = x1 + pw, y1 + ph

    cx1, cy1 = max(0, x1), max(0, y1)
    cx2, cy2 = min(W, x2), min(H, y2)
    if cx2 <= cx1 or cy2 <= cy1:
        return
    px1, py1 = cx1 - x1, cy1 - y1
    px2, py2 = px1 + (cx2 - cx1), py1 + (cy2 - cy1)

    sub_src = cur[py1:py2, px1:px2]
    sub_dst = frame_bgr[cy1:cy2, cx1:cx2]

    a = sub_src[:, :, 3:4].astype(np.uint16)
    inv_a = 255 - a
    sub_dst[:] = ((sub_dst.astype(np.uint16) * inv_a + sub_src[:, :, :3].astype(np.uint16) * a) >> 8).astype(np.uint8)

# =========================================================================
# OPTION 2: SELF-DRAWING 45° ANGLED LEADER LINE CALLOUTS (o──╱──────)
# =========================================================================
def draw_animated_leader_callout(
    frame_bgr: np.ndarray,
    anchor_pt: tuple,
    elbow_pt: tuple,
    end_x: int,
    label_top: str,
    num_str: str,
    raw_t: float,
    appear_t: float,
    style: str = "gold",
    phase: float = 0.0,
    num_size: int = 56,
):
    """
    Draws Option 2's Apple/Bloomberg 45-degree angled leader line (o──╱──────)
    that self-draws from `anchor_pt` -> `elbow_pt` -> `(end_x, elbow_y)` over 0.25s,
    while the 3D metallic number and tracked label levitate smoothly above/below the shelf!
    """
    if raw_t < appear_t:
        return
    dt = raw_t - appear_t
    prog = min(1.0, dt / 0.24)
    ease = 1.0 - (1.0 - prog) ** 3

    # Continuous gentle 3D levitation ("hiệu ứng lơ lửng")
    dx = int(round(5.0 * math.cos(raw_t * 2.2 + phase)))
    dy = int(round(8.5 * math.sin(raw_t * 2.6 + phase)))

    ax, ay = anchor_pt[0] + dx // 2, anchor_pt[1] + dy // 2
    ex, ey = elbow_pt[0] + dx, elbow_pt[1] + dy
    end_x_b = end_x + dx

    col_gold_bgr = (108, 178, 218)  # #DAB26C in BGR
    col_white_bgr = (250, 252, 252)

    # 1. Origin target ring at anchor_pt
    cv2.circle(frame_bgr, (ax, ay), 7, col_gold_bgr, 2, cv2.LINE_AA)
    cv2.circle(frame_bgr, (ax, ay), 3, col_white_bgr, -1, cv2.LINE_AA)

    # 2. Self-drawing 2-segment leader line
    if ease <= 0.35:
        p1 = ease / 0.35
        cur_ex = int(round(ax + (ex - ax) * p1))
        cur_ey = int(round(ay + (ey - ay) * p1))
        cv2.line(frame_bgr, (ax, ay), (cur_ex, cur_ey), col_gold_bgr, 2, cv2.LINE_AA)
    else:
        cv2.line(frame_bgr, (ax, ay), (ex, ey), col_gold_bgr, 2, cv2.LINE_AA)
        p2 = (ease - 0.35) / 0.65
        cur_end_x = int(round(ex + (end_x_b - ex) * p2))
        cv2.line(frame_bgr, (ex, ey), (cur_end_x, ey), col_gold_bgr, 2, cv2.LINE_AA)
        if p2 >= 0.95:
            cv2.circle(frame_bgr, (end_x_b, ey), 4, col_gold_bgr, -1, cv2.LINE_AA)

    # 3. Levitating 3D Metallic Number above shelf & Tracked Label below shelf
    tx = (ex + end_x) // 2
    ty_base = elbow_pt[1]
    p_num = get_luxury_text_patch(num_str, FONT_BLACK, num_size, style=style, extrude=4, tracking=2)
    p_lbl = get_luxury_text_patch(label_top, FONT_BOLD, 20, style="white", extrude=2, tracking=3)
    blend_bgra_onto_bgr(frame_bgr, p_num, tx, ty_base - 40, raw_t, appear_t + 0.06, 0.28, "scale_pop", dx, dy)
    blend_bgra_onto_bgr(frame_bgr, p_lbl, tx, ty_base + 22, raw_t, appear_t + 0.12, 0.25, "slide_up", dx, dy)

# =========================================================================
# HAIR + HEAD ROTOSCOPING FOR BEHIND-HEAD CARDS
# =========================================================================
def extract_speaker_head_matte(frame_bgr: np.ndarray, y1: int = 440, y2: int = 620, x1: int = 260, x2: int = 760) -> np.ndarray:
    roi = frame_bgr[y1:y2, x1:x2]
    b, g, r = roi[:, :, 0].astype(np.float32), roi[:, :, 1].astype(np.float32), roi[:, :, 2].astype(np.float32)
    luma = 0.299 * r + 0.587 * g + 0.114 * b
    hair_alpha = np.clip((120.0 - luma) / 38.0, 0.0, 1.0)
    h_r, w_r = roi.shape[:2]
    yy, xx = np.ogrid[:h_r, :w_r]
    ell = ((xx - (505 - x1)) / 128.0) ** 2 + ((yy - (655 - y1)) / 185.0) ** 2
    head_core = np.clip((1.15 - ell) * 4.0, 0.0, 1.0)
    horiz_gate = np.clip(1.0 - np.abs(xx - (505 - x1)) / 205.0, 0.0, 1.0)
    matte = np.maximum(hair_alpha * (horiz_gate > 0.05), head_core)
    matte_u8 = (matte * 255.0).astype(np.uint8)
    matte_u8 = cv2.GaussianBlur(matte_u8, (7, 7), 0)
    return matte_u8[:, :, None]

def blend_card_behind_head(frame_bgr: np.ndarray, card_patch_info: tuple, cx: int, cy: int, local_t: float, start_t: float, dur_in: float = 0.35, bob_dx: float = 0.0, bob_dy: float = 0.0):
    ry1, ry2, rx1, rx2 = 450, 625, 280, 740
    orig_roi = frame_bgr[ry1:ry2, rx1:rx2].copy()
    matte = extract_speaker_head_matte(frame_bgr, ry1, ry2, rx1, rx2)
    blend_bgra_onto_bgr(frame_bgr, card_patch_info, cx, cy, local_t, start_t, dur_in, "scale_pop", bob_dx, bob_dy)
    cur_roi = frame_bgr[ry1:ry2, rx1:rx2]
    m16 = matte.astype(np.uint16)
    inv_m16 = 255 - m16
    cur_roi[:] = ((cur_roi.astype(np.uint16) * inv_m16 + orig_roi.astype(np.uint16) * m16) >> 8).astype(np.uint8)

_VIGNETTE_CACHE = {}
def add_subtle_lower_contrast(frame_bgr: np.ndarray, cx: int, cy: int, rx: int, ry: int, max_alpha: int = 115):
    key = (rx, ry, max_alpha)
    if key not in _VIGNETTE_CACHE:
        vw, vh = rx * 2, ry * 2
        yy, xx = np.ogrid[-ry:ry, -rx:rx]
        dist2 = (xx / float(rx)) ** 2 + (yy / float(ry)) ** 2
        alpha = np.clip(1.0 - dist2, 0.0, 1.0) ** 1.8 * max_alpha
        vig = np.zeros((vh, vw, 4), dtype=np.uint8)
        vig[:, :, 0] = 18
        vig[:, :, 1] = 10
        vig[:, :, 2] = 6
        vig[:, :, 3] = alpha.astype(np.uint8)
        _VIGNETTE_CACHE[key] = (vig, -rx, -ry)
    blend_bgra_onto_bgr(frame_bgr, _VIGNETTE_CACHE[key], cx, cy, 1.0, 0.0, 0.01, "slide_up")

ASSETS = {}
def make_clean_rounded_asset(pil_img, w, h, radius=28, border_rgb=(218, 178, 108), border_w=2):
    pad = 18
    cw, ch = w + pad * 2, h + pad * 2
    out = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    draw.rounded_rectangle([pad + 2, pad + 8, pad + w + 2, pad + h + 8], radius=radius, fill=(0, 0, 0, 135))
    out = out.filter(ImageFilter.GaussianBlur(radius=7))
    draw = ImageDraw.Draw(out)
    resized = pil_img.resize((w, h), Image.Resampling.LANCZOS)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out.paste(resized, (pad, pad), mask)
    if border_rgb and border_w > 0:
        draw.rounded_rectangle([pad, pad, pad + w, pad + h], radius=radius, outline=(*border_rgb, 215), width=border_w)
    return (rgba_to_bgra(np.array(out, dtype=np.uint8)), -cw // 2, -ch // 2)

def make_feathered_band(width=820, height=165, has_center_divider=True):
    """Creates Option 2's signature Feathered Frosted Summary Strip (no boxy left/right borders!)."""
    bd_arr = np.zeros((height, width, 4), dtype=np.uint8)
    x_lin = np.linspace(-1.0, 1.0, width)[None, :]
    fade_x = np.clip(1.0 - np.abs(x_lin) ** 2.8, 0.0, 1.0)
    bd_arr[:, :, 0] = 8
    bd_arr[:, :, 1] = 16
    bd_arr[:, :, 2] = 26
    bd_arr[:, :, 3] = (fade_x * 195).astype(np.uint8)
    band = Image.fromarray(bd_arr, mode="RGBA")
    bd_draw = ImageDraw.Draw(band)
    bd_draw.line([(80, 2), (width - 80, 2)], fill=(*CHAMPAGNE_GOLD, 215), width=2)
    bd_draw.line([(80, height - 3), (width - 80, height - 3)], fill=(*CHAMPAGNE_GOLD, 215), width=2)
    if has_center_divider:
        bd_draw.line([(width // 2, 24), (width // 2, height - 24)], fill=(*CHAMPAGNE_GOLD, 135), width=2)
    return (rgba_to_bgra(np.array(band, dtype=np.uint8)), -width // 2, -height // 2)

def load_assets():
    if ASSETS:
        return ASSETS
    sms_raw = Image.open(IMG_SMS).convert("RGBA").crop((28, 66, 972, 398))
    ASSETS["sms_large"] = make_clean_rounded_asset(sms_raw, 830, int(830 * (332 / 944.0)), radius=46, border_rgb=(255, 255, 255), border_w=2)
    ASSETS["sms_compact"] = make_clean_rounded_asset(sms_raw, 650, int(650 * (332 / 944.0)), radius=38, border_rgb=(255, 255, 255), border_w=2)

    pb_raw = Image.open(IMG_PASSBOOK).convert("RGBA")
    bbox = pb_raw.getbbox()
    if bbox:
        pb_raw = pb_raw.crop(bbox)
    pb_w = 265
    pb_h = int(pb_w * (pb_raw.height / pb_raw.width))
    pb_rsz = pb_raw.resize((pb_w, pb_h), Image.Resampling.LANCZOS)
    ASSETS["passbook"] = (rgba_to_bgra(np.array(pb_rsz, dtype=np.uint8)), -pb_w // 2, -pb_h // 2)

    an_cu_raw = Image.open(IMG_AN_CU).convert("RGBA")
    ASSETS["an_cu_card"] = make_clean_rounded_asset(an_cu_raw, 300, int(300 * (1000 / 563.0)), radius=26, border_rgb=CHAMPAGNE_GOLD, border_w=2)

    eb_raw = Image.open(IMG_EARLY_BIRD).convert("RGBA")
    su_raw = Image.open(IMG_SHOW_UNIT).convert("RGBA")
    ASSETS["eb_med"] = make_clean_rounded_asset(eb_raw, 300, int(300 * 1.25), radius=24, border_rgb=CHAMPAGNE_GOLD, border_w=2)
    ASSETS["su_med"] = make_clean_rounded_asset(su_raw, 300, int(300 * 1.25), radius=24, border_rgb=MINT_LUX, border_w=2)
    ASSETS["eb_small"] = make_clean_rounded_asset(eb_raw, 195, int(195 * 1.25), radius=20, border_rgb=CHAMPAGNE_GOLD, border_w=2)
    ASSETS["su_small"] = make_clean_rounded_asset(su_raw, 195, int(195 * 1.25), radius=20, border_rgb=MINT_LUX, border_w=2)

    cake_raw = Image.open(IMG_CAKE_LOGO).convert("RGBA")
    cake_card = Image.new("RGBA", (290, 118), (255, 255, 255, 245))
    cr = cake_raw.resize((245, int(245 * (402 / 1000.0))), Image.Resampling.LANCZOS)
    cake_card.paste(cr, (22, 10), cr)
    ASSETS["cake_logo"] = make_clean_rounded_asset(cake_card, 290, 118, radius=24, border_rgb=CHAMPAGNE_GOLD, border_w=2)

    mik_raw = Image.open(IMG_MIK_LOGO).convert("RGBA")
    mik_card = Image.new("RGBA", (255, 118), (255, 255, 255, 245))
    mr = mik_raw.resize((215, int(215 * (360 / 694.0))), Image.Resampling.LANCZOS)
    mik_card.paste(mr, (20, 4))
    ASSETS["mik_logo"] = make_clean_rounded_asset(mik_card, 255, 118, radius=22, border_rgb=CHAMPAGNE_GOLD, border_w=2)

    # Option 2 Feathered Frosted Bands
    ASSETS["feathered_band_split"] = make_feathered_band(820, 165, has_center_divider=True)
    ASSETS["feathered_band_single"] = make_feathered_band(820, 105, has_center_divider=False)

    # Pre-render 40 frames of Option 2 Luxury Chronograph Countdown on Feathered Band
    ASSETS["countdown_frames"] = {}
    for step_i in range(40):
        dt_cd = step_i * 0.085
        im = Image.new("RGBA", (820, 185), (0, 0, 0, 0))
        # Feathered background strip
        bd_arr = np.zeros((185, 820, 4), dtype=np.uint8)
        x_lin = np.linspace(-1.0, 1.0, 820)[None, :]
        fade_x = np.clip(1.0 - np.abs(x_lin) ** 2.8, 0.0, 1.0)
        bd_arr[:, :, 0] = 8
        bd_arr[:, :, 1] = 16
        bd_arr[:, :, 2] = 26
        bd_arr[:, :, 3] = (fade_x * 190).astype(np.uint8)
        im = Image.fromarray(bd_arr, mode="RGBA")
        d = ImageDraw.Draw(im)
        d.line([(70, 2), (750, 2)], fill=(*CHAMPAGNE_GOLD, 215), width=2)
        d.line([(70, 182), (750, 182)], fill=(*CHAMPAGNE_GOLD, 215), width=2)

        cx_c, cy_c, r_c = 96, 92, 70
        pulse_r = int(5 + 10 * ((dt_cd * 2.5) % 1.0))
        a_r = int(160 * (1.0 - ((dt_cd * 2.5) % 1.0)))
        d.ellipse([cx_c - r_c - pulse_r, cy_c - r_c - pulse_r, cx_c + r_c + pulse_r, cy_c + r_c + pulse_r], outline=(*CHAMPAGNE_GOLD, a_r), width=2)
        d.ellipse([cx_c - r_c, cy_c - r_c, cx_c + r_c, cy_c + r_c], fill=(8, 16, 26, 200), outline=(*CHAMPAGNE_GOLD, 235), width=3)
        for h_i in range(12):
            ang = math.radians(h_i * 30 - 90)
            r_in = r_c - 12 if h_i % 3 == 0 else r_c - 6
            d.line([
                (cx_c + int(r_in * math.cos(ang)), cy_c + int(r_in * math.sin(ang))),
                (cx_c + int((r_c - 3) * math.cos(ang)), cy_c + int((r_c - 3) * math.sin(ang)))
            ], fill=(*CHAMPAGNE_LIGHT, 255) if h_i % 3 == 0 else (255, 255, 255, 180), width=3 if h_i % 3 == 0 else 2)
        sweep_deg = int((dt_cd * 160) % 360)
        d.arc([cx_c - r_c + 5, cy_c - r_c + 5, cx_c + r_c - 5, cy_c + r_c - 5], start=-90, end=-90 + sweep_deg, fill=(*MINT_LUX, 255), width=4)
        ang_h = math.radians(dt_cd * 30 - 45)
        ang_s = math.radians(sweep_deg - 90)
        d.line([(cx_c, cy_c), (cx_c + int(36 * math.cos(ang_h)), cy_c + int(36 * math.sin(ang_h)))], fill=(255, 255, 255, 255), width=4)
        d.line([(cx_c, cy_c), (cx_c + int(54 * math.cos(ang_s)), cy_c + int(54 * math.sin(ang_s)))], fill=(*CHAMPAGNE_LIGHT, 255), width=3)
        d.ellipse([cx_c - 5, cy_c - 5, cx_c + 5, cy_c + 5], fill=(*CHAMPAGNE_GOLD, 255), outline=(255, 255, 255, 255), width=2)

        rem_s = max(0.0, 58.9 - dt_cd * 4.0)
        sec_i = int(rem_s)
        ms_i = int((rem_s - sec_i) * 100)
        units = [
            ("09", "NGÀY", PEARL_WHITE),
            ("22", "GIỜ", PEARL_WHITE),
            ("51", "PHÚT", CHAMPAGNE_LIGHT),
            (f"{sec_i:02d}", f"GIÂY .{ms_i:02d}", MINT_LUX),
        ]
        bx0, bw_u, gap_u = 196, 138, 16
        for idx, (v_str, u_lbl, v_rgb) in enumerate(units):
            xl = bx0 + idx * (bw_u + gap_u)
            xr = xl + bw_u
            xm = (xl + xr) // 2
            f_num = get_font(FONT_BLACK, 62)
            for ed_i in range(4, 0, -1):
                d.text((xm + ed_i, 74 + ed_i), v_str, font=f_num, fill=(6, 12, 20, 240), anchor="mm", stroke_width=2, stroke_fill=(6, 12, 20, 240))
            d.text((xm, 74), v_str, font=f_num, fill=(*v_rgb, 255), anchor="mm", stroke_width=2, stroke_fill=(6, 12, 20, 255))
            d.text((xm, 142), u_lbl, font=get_font(FONT_BOLD, 19), fill=(*SILVER_MIST, 245), anchor="mm", stroke_width=2, stroke_fill=(6, 12, 20, 230))
            if idx < 3:
                cx_dot = xr + gap_u // 2
                d.ellipse([cx_dot - 3, 58, cx_dot + 3, 64], fill=(*CHAMPAGNE_GOLD, 230))
                d.ellipse([cx_dot - 3, 88, cx_dot + 3, 94], fill=(*CHAMPAGNE_GOLD, 230))

        ASSETS["countdown_frames"][step_i] = (rgba_to_bgra(np.array(im, dtype=np.uint8)), -410, -92)

    return ASSETS

def render_onto_frame_bgr(frame_bgr: np.ndarray, raw_t: float):
    """
    Renders Option 2 (Angled Leader-Line Callout + Feathered Frosted Summary Strip)
    across the entire video with Quiet-Luxury Champagne Gold, Pearl White & Tiffany Mint.
    """
    assets = load_assets()
    bob_y = 7.0 * math.sin(raw_t * 2.6)
    bob_x = 4.5 * math.cos(raw_t * 2.1)

    # =========================================================================
    # SCENE 1: SMS HOOK & FINGER POINTING UP (0.12 -> 9.25)
    # =========================================================================
    if raw_t < 9.50:
        if raw_t < 2.55:
            blend_bgra_onto_bgr(frame_bgr, assets["sms_large"], 510, 380, raw_t, 0.12, 0.38, "scale_pop", 0, bob_y * 0.6)
            if 0.12 <= raw_t <= 1.55:
                fx, fy = 725, 508
                pulse_p = ((raw_t - 0.12) * 2.4) % 1.0
                for by_dot in range(535, 660, 26):
                    cv2.circle(frame_bgr, (fx, by_dot), 4, (108, 178, 218), -1, cv2.LINE_AA)
                r1 = int(16 + 52 * pulse_p)
                cv2.circle(frame_bgr, (fx, fy), r1, (207, 243, 252), 2, cv2.LINE_AA)
                cv2.circle(frame_bgr, (fx, fy), 8, (108, 178, 218), -1, cv2.LINE_AA)

            if raw_t >= 0.68:
                add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1235, 390, 130, max_alpha=100)
                p1 = get_luxury_text_patch("Câu hỏi quen thuộc", FONT_SERIF_BOLD_IT, 42, style="serif_gold", extrude=2, tracking=2)
                p2 = get_luxury_text_patch("NGHE MỖI NGÀY", FONT_BLACK, 60, style="white", extrude=5, tracking=4)
                blend_bgra_onto_bgr(frame_bgr, p1, X_SAFE_CENTER, 1175, raw_t, 0.68, 0.25, "slide_up")
                blend_bgra_onto_bgr(frame_bgr, p2, X_SAFE_CENTER, 1258, raw_t, 0.78, 0.30, "scale_pop")
        else:
            blend_bgra_onto_bgr(frame_bgr, assets["sms_compact"], 480, 355, raw_t, 2.72, 0.30, "slide_up", 0, bob_y * 0.5)
            add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1235, 410, 145, max_alpha=105)

            if raw_t < 6.42:
                p_a1 = get_luxury_text_patch("TIẾT KIỆM & MUA NHÀ", FONT_BOLD, 34, style="silver", extrude=3, tracking=4)
                p_a2 = get_luxury_text_patch("CÙNG MỘT LÚC", FONT_BLACK, 62, style="gold", extrude=5, tracking=4)
                blend_bgra_onto_bgr(frame_bgr, p_a1, X_SAFE_CENTER, 1175, raw_t, 3.25, 0.26, "slide_up")
                blend_bgra_onto_bgr(frame_bgr, p_a2, X_SAFE_CENTER, 1262, raw_t, 4.30, 0.32, "scale_pop")
            else:
                p_b1 = get_luxury_text_patch("ĐƯỢC LUÔN!", FONT_BLACK, 68, style="mint", extrude=6, tracking=4)
                p_b2 = get_luxury_text_patch("Anh chị có tin không?", FONT_SERIF_BOLD_IT, 42, style="serif_gold", extrude=2, tracking=2)
                blend_bgra_onto_bgr(frame_bgr, p_b1, X_SAFE_CENTER, 1185, raw_t, 6.45, 0.28, "scale_pop")
                if raw_t >= 8.20:
                    blend_bgra_onto_bgr(frame_bgr, p_b2, X_SAFE_CENTER, 1278, raw_t, 8.25, 0.28, "slide_up")

    # =========================================================================
    # SCENE 2: IMPERIA SENSA PARK & CAKE BY VPBANK (9.98 -> 21.96)
    # =========================================================================
    elif raw_t < 22.10:
        if raw_t < 13.35:
            blend_card_behind_head(frame_bgr, assets["an_cu_card"], 230, 495, raw_t, 9.98, 0.38, 0, bob_y * 0.6)
            add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1235, 410, 140, max_alpha=105)

            p_s1 = get_luxury_text_patch("IMPERIA SENSA PARK", FONT_BOLD, 34, style="silver", extrude=3, tracking=4)
            p_s2 = get_luxury_text_patch("AN CƯ SINH LỜI", FONT_BLACK, 62, style="gold", extrude=6, tracking=4)
            blend_bgra_onto_bgr(frame_bgr, p_s1, X_SAFE_CENTER, 1175, raw_t, 10.02, 0.25, "slide_up")
            blend_bgra_onto_bgr(frame_bgr, p_s2, X_SAFE_CENTER, 1262, raw_t, 10.15, 0.32, "scale_pop")
        else:
            blend_bgra_onto_bgr(frame_bgr, assets["cake_logo"], 755, 315, raw_t, 13.45, 0.35, "scale_pop", 0, bob_y * 0.5)
            if raw_t >= 17.80:
                blend_card_behind_head(frame_bgr, assets["passbook"], 215, 420, raw_t, 17.80, 0.42, bob_x, -bob_y * 0.7)

            # Option 2 Angled Leader Callout for "10% GIÁ TRỊ CĂN HỘ" at 16.00s!
            if raw_t >= 16.00:
                draw_animated_leader_callout(
                    frame_bgr,
                    anchor_pt=(635, 565),
                    elbow_pt=(675, 525),
                    end_x=965,
                    label_top="GIÁ TRỊ CĂN HỘ",
                    num_str="GỬI 10%",
                    raw_t=raw_t,
                    appear_t=16.00,
                    style="gold",
                    phase=1.0,
                    num_size=54,
                )

            add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1235, 410, 140, max_alpha=105)
            if raw_t < 18.25:
                p_c1 = get_luxury_text_patch("MỞ SỔ TIẾT KIỆM", FONT_BOLD, 34, style="silver", extrude=3, tracking=4)
                p_c2 = get_luxury_text_patch("CAKE BY VPBANK", FONT_BLACK, 58, style="mint", extrude=5, tracking=4)
                blend_bgra_onto_bgr(frame_bgr, p_c1, X_SAFE_CENTER, 1175, raw_t, 13.50, 0.25, "slide_up")
                blend_bgra_onto_bgr(frame_bgr, p_c2, X_SAFE_CENTER, 1260, raw_t, 13.65, 0.30, "scale_pop")
            else:
                p_c3 = get_luxury_text_patch("Sổ đứng tên anh chị", FONT_SERIF_BOLD_IT, 42, style="serif_gold", extrude=2, tracking=2)
                p_c4 = get_luxury_text_patch("HƯỞNG LÃI CHỜ NHÀ", FONT_BLACK, 56, style="white", extrude=5, tracking=4)
                blend_bgra_onto_bgr(frame_bgr, p_c3, X_SAFE_CENTER, 1175, raw_t, 18.25, 0.25, "slide_up")
                blend_bgra_onto_bgr(frame_bgr, p_c4, X_SAFE_CENTER, 1260, raw_t, 19.90, 0.32, "scale_pop")

    # =========================================================================
    # SCENE 3: OPTION 2 — ANGLED LEADER-LINE CALLOUTS + FEATHERED SUMMARY BAND (22.16 -> 40.94)
    # =========================================================================
    elif raw_t < 41.05:
        if raw_t < 24.10:
            add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1235, 400, 135, max_alpha=100)
            p_i1 = get_luxury_text_patch("Bài toán dòng tiền", FONT_SERIF_BOLD_IT, 42, style="serif_gold", extrude=2, tracking=2)
            p_i2 = get_luxury_text_patch("CĂN 2 PHÒNG NGỦ", FONT_BLACK, 58, style="white", extrude=5, tracking=4)
            blend_bgra_onto_bgr(frame_bgr, p_i1, X_SAFE_CENTER, 1175, raw_t, 22.16, 0.25, "slide_up")
            blend_bgra_onto_bgr(frame_bgr, p_i2, X_SAFE_CENTER, 1260, raw_t, 22.30, 0.30, "scale_pop")
        else:
            # Soft ambient contrast zones matching Option_2_Apple_Angled_Leader_Line.png
            add_subtle_lower_contrast(frame_bgr, 230, 415, 220, 210, max_alpha=95)
            add_subtle_lower_contrast(frame_bgr, 790, 415, 220, 210, max_alpha=95)
            if raw_t >= 31.05:
                add_subtle_lower_contrast(frame_bgr, 468, 1215, 440, 200, max_alpha=145)

            # 1. "~6 TỶ" (24.15s)
            draw_animated_leader_callout(frame_bgr, (385, 385), (345, 345), 65, "GIÁ CĂN 2 PHÒNG NGỦ", "~6 TỶ", raw_t, 24.15, style="mint", phase=0.0, num_size=56)
            # 2. "600 TRIỆU" (26.05s)
            draw_animated_leader_callout(frame_bgr, (635, 385), (675, 345), 965, "GỬI SỔ CAKE (10%)", "600 TRIỆU", raw_t, 26.05, style="gold", phase=1.2, num_size=56)
            # 3. "9,6%/NĂM" (27.80s)
            draw_animated_leader_callout(frame_bgr, (345, 575), (310, 540), 65, "LÃI SUẤT MỖI NĂM", "9,6%/NĂM", raw_t, 27.80, style="gold", phase=2.4, num_size=52)
            # 4. "23 THÁNG" (29.55s)
            draw_animated_leader_callout(frame_bgr, (675, 575), (710, 540), 965, "KỲ HẠN TÍCH LŨY", "23 THÁNG", raw_t, 29.55, style="mint", phase=3.6, num_size=52)
            # 5. "+110 TRIỆU" (31.05s)
            draw_animated_leader_callout(frame_bgr, (380, 1085), (345, 1115), 65, "TIỀN LÃI 23 THÁNG", "+110 TRIỆU", raw_t, 31.05, style="mint", phase=4.5, num_size=54)
            # 6. "+60 TRIỆU" (33.40s)
            draw_animated_leader_callout(frame_bgr, (555, 1085), (590, 1115), 870, "QUÀ TẶNG CĂN 2PN", "+60 TRIỆU", raw_t, 33.40, style="gold", phase=5.7, num_size=54)

            # 7 & 8. Option 2 Feathered Frosted Summary Band at Y=1288 (36.10s & 37.85s)
            if raw_t >= 36.10:
                dx7 = int(round(4.5 * math.cos(raw_t * 2.2 + 1.0)))
                dy7 = int(round(7.0 * math.sin(raw_t * 2.5 + 1.0)))
                blend_bgra_onto_bgr(frame_bgr, assets["feathered_band_split"], 468, 1288, raw_t, 36.10, 0.28, "scale_pop", dx7, dy7)

                p7_lbl = get_luxury_text_patch("TỔNG LỢI ÍCH NHẬN VỀ", FONT_BOLD, 19, style="silver", extrude=2, tracking=3)
                p7_num = get_luxury_text_patch("170 TRIỆU", FONT_BLACK, 62, style="mint", extrude=5, tracking=2)
                blend_bgra_onto_bgr(frame_bgr, p7_lbl, 260, 1236, raw_t, 36.12, 0.22, "slide_up", dx7, dy7)
                blend_bgra_onto_bgr(frame_bgr, p7_num, 260, 1302, raw_t, 36.18, 0.28, "scale_pop", dx7, dy7)

                if raw_t >= 37.85:
                    p8_lbl = get_luxury_text_patch("TƯƠNG ĐƯƠNG LÃI SUẤT", FONT_BOLD, 19, style="serif_gold", extrude=2, tracking=3)
                    p8_num = get_luxury_text_patch("~14,8%/NĂM", FONT_BLACK, 60, style="gold", extrude=5, tracking=2)
                    blend_bgra_onto_bgr(frame_bgr, p8_lbl, 675, 1236, raw_t, 37.85, 0.22, "slide_up", dx7, dy7)
                    blend_bgra_onto_bgr(frame_bgr, p8_num, 675, 1302, raw_t, 37.92, 0.28, "scale_pop", dx7, dy7)

    # =========================================================================
    # SCENE 4: MATURITY, HANDOVER & MIK GROUP (41.10 -> 47.92)
    # =========================================================================
    elif raw_t < 48.30:
        blend_bgra_onto_bgr(frame_bgr, assets["mik_logo"], 205, 310, raw_t, 41.10, 0.35, "scale_pop", 0, bob_y * 0.5)
        add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1225, 420, 165, max_alpha=110)

        if raw_t >= 41.20:
            prog_line = min(1.0, max(0.0, (raw_t - 41.20) / 2.5))
            end_x = int(175 + (760 - 175) * prog_line)
            cv2.line(frame_bgr, (175, 1115), (end_x, 1115), (108, 178, 218), 3, cv2.LINE_AA)

        nodes = [
            (175, 1115, "1. ĐÁO HẠN SỔ", 41.20),
            (468, 1115, "2. +LÃI & QUÀ", 42.30),
            (760, 1115, "3. NHẬN NHÀ", 43.50),
        ]
        for nx, ny, nlbl, nt in nodes:
            active = raw_t >= nt
            col_bgr = (108, 178, 218) if active else (170, 170, 170)
            cv2.circle(frame_bgr, (nx, ny), 16, (20, 14, 8), -1, cv2.LINE_AA)
            cv2.circle(frame_bgr, (nx, ny), 16, col_bgr, 2, cv2.LINE_AA)
            cv2.circle(frame_bgr, (nx, ny), 5, (250, 252, 252) if active else col_bgr, -1, cv2.LINE_AA)
            p_nl = get_luxury_text_patch(nlbl, FONT_BOLD, 21, style="gold" if active else "silver", extrude=2, tracking=2)
            blend_bgra_onto_bgr(frame_bgr, p_nl, nx, ny - 40, raw_t, 41.10, 0.20, "slide_up")

        p_m1 = get_luxury_text_patch("TIỀN MÌNH VẪN SINH LỜI", FONT_BOLD, 34, style="silver", extrude=3, tracking=4)
        p_m2 = get_luxury_text_patch("GIỮ ĐƯỢC CĂN ĐẸP", FONT_BLACK, 58, style="gold", extrude=6, tracking=4)
        blend_bgra_onto_bgr(frame_bgr, p_m1, X_SAFE_CENTER, 1205, raw_t, 45.05, 0.25, "slide_up")
        blend_bgra_onto_bgr(frame_bgr, p_m2, X_SAFE_CENTER, 1290, raw_t, 46.20, 0.30, "scale_pop")

    # =========================================================================
    # SCENE 5: EARLY BIRD 1,5% + SHOW UNIT 0,5% + COUNTDOWN (48.72 -> 59.45)
    # Uses Option 2 Angled Leader Callouts + Feathered Frosted Band!
    # =========================================================================
    elif raw_t < 59.80:
        if raw_t < 56.15:
            if raw_t < 50.00:
                add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1235, 390, 130, max_alpha=100)
                p_cn1 = get_luxury_text_patch("Chính sách cộng thêm", FONT_SERIF_BOLD_IT, 42, style="serif_white", extrude=2, tracking=2)
                p_cn2 = get_luxury_text_patch("+2 ƯU ĐÃI ĐẶC BIỆT", FONT_BLACK, 58, style="gold", extrude=6, tracking=4)
                blend_bgra_onto_bgr(frame_bgr, p_cn1, X_SAFE_CENTER, 1175, raw_t, 48.72, 0.24, "slide_up")
                blend_bgra_onto_bgr(frame_bgr, p_cn2, X_SAFE_CENTER, 1260, raw_t, 48.80, 0.30, "scale_pop")
            else:
                blend_card_behind_head(frame_bgr, assets["eb_med"], 225, 440, raw_t, 50.00, 0.38, 0, bob_y * 0.6)
                if raw_t >= 53.20:
                    blend_card_behind_head(frame_bgr, assets["su_med"], 815, 440, raw_t, 53.20, 0.38, 0, -bob_y * 0.6)

                add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1220, 430, 175, max_alpha=135)

                # Option 2 Angled Leader Callouts for 1,5% and +0,5%
                draw_animated_leader_callout(frame_bgr, (380, 1110), (345, 1140), 65, "ƯU ĐÃI BOOKING SỚM", "1,5%", raw_t, 50.80, style="mint", phase=0.5, num_size=64)
                if raw_t >= 53.20:
                    draw_animated_leader_callout(frame_bgr, (555, 1110), (590, 1140), 870, "MỞ CỬA NHÀ MẪU", "+0,5%", raw_t, 53.25, style="gold", phase=2.0, num_size=64)

                    blend_bgra_onto_bgr(frame_bgr, assets["feathered_band_single"], 468, 1295, raw_t, 53.65, 0.28, "scale_pop")
                    p_tot = get_luxury_text_patch("TỔNG ƯU ĐÃI GIỮ CHỖ: 2,0%", FONT_EXTRABOLD, 38, style="gold", extrude=4, tracking=4)
                    blend_bgra_onto_bgr(frame_bgr, p_tot, X_SAFE_CENTER, 1295, raw_t, 53.70, 0.28, "slide_up")
        else:
            # Act 5B (56.24 -> 59.45): OPTION 2 FEATHERED LUXURY 3D CHRONOGRAPH COUNTDOWN
            dt_cd = max(0.0, raw_t - 56.15)
            blend_bgra_onto_bgr(frame_bgr, assets["eb_small"], 175, 370, raw_t, 56.15, 0.25, "slide_up")
            blend_bgra_onto_bgr(frame_bgr, assets["su_small"], 855, 370, raw_t, 56.15, 0.25, "slide_up")

            add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1190, 425, 195, max_alpha=125)

            p_cd1 = get_luxury_text_patch("ƯU ĐÃI GIỮ CHỖ CÓ HẠN", FONT_BOLD, 30, style="silver", extrude=3, tracking=4)
            p_cd2 = get_luxury_text_patch("SẮP KẾT THÚC!", FONT_BLACK, 54, style="gold", extrude=6, tracking=4)
            blend_bgra_onto_bgr(frame_bgr, p_cd1, X_SAFE_CENTER, 985, raw_t, 56.18, 0.24, "slide_up")
            blend_bgra_onto_bgr(frame_bgr, p_cd2, X_SAFE_CENTER, 1052, raw_t, 56.24, 0.28, "scale_pop")

            step_idx = min(39, max(0, int(dt_cd / 0.085)))
            cd_patch = assets["countdown_frames"][step_idx]
            blend_bgra_onto_bgr(frame_bgr, cd_patch, 468, 1205, raw_t, 56.20, 0.25, "scale_pop")

            p_cd_bot = get_luxury_text_patch("ÁP DỤNG ĐẾN 15/11/2026", FONT_BOLD, 28, style="mint", extrude=3, tracking=4)
            blend_bgra_onto_bgr(frame_bgr, p_cd_bot, X_SAFE_CENTER, 1345, raw_t, 56.35, 0.26, "slide_up")

    # =========================================================================
    # SCENE 6: OPTION 2 LUXURY CTA (60.14 -> 68.40)
    # =========================================================================
    else:
        add_subtle_lower_contrast(frame_bgr, X_SAFE_CENTER, 1225, 415, 155, max_alpha=110)
        if raw_t < 64.90:
            p_cta1 = get_luxury_text_patch("NHẬN BẢNG TÍNH CHI TIẾT", FONT_BOLD, 34, style="silver", extrude=3, tracking=4)
            p_cta2 = get_luxury_text_patch("BÌNH LUẬN BÊN DƯỚI", FONT_BLACK, 58, style="gold", extrude=6, tracking=4)
            p_cta3 = get_luxury_text_patch("Gốc • Lãi suất • Quà tặng 2PN", FONT_SERIF_BOLD_IT, 36, style="serif_white", extrude=2, tracking=2)
            blend_bgra_onto_bgr(frame_bgr, p_cta1, X_SAFE_CENTER, 1145, raw_t, 60.14, 0.24, "slide_up")
            blend_bgra_onto_bgr(frame_bgr, p_cta2, X_SAFE_CENTER, 1230, raw_t, 60.25, 0.30, "scale_pop")
            blend_bgra_onto_bgr(frame_bgr, p_cta3, X_SAFE_CENTER, 1315, raw_t, 60.45, 0.28, "slide_up")
        else:
            p_f1 = get_luxury_text_patch("Follow kênh đón xem", FONT_SERIF_BOLD_IT, 40, style="serif_gold", extrude=2, tracking=2)
            p_f2 = get_luxury_text_patch("CHỌN PHƯƠNG THỨC", FONT_BOLD, 38, style="white", extrude=4, tracking=4)
            p_f3 = get_luxury_text_patch("THANH TOÁN TỐI ƯU", FONT_BLACK, 56, style="gold", extrude=6, tracking=4)
            blend_bgra_onto_bgr(frame_bgr, p_f1, X_SAFE_CENTER, 1140, raw_t, 65.26, 0.24, "slide_up")
            blend_bgra_onto_bgr(frame_bgr, p_f2, X_SAFE_CENTER, 1218, raw_t, 65.40, 0.26, "slide_up")
            blend_bgra_onto_bgr(frame_bgr, p_f3, X_SAFE_CENTER, 1300, raw_t, 65.55, 0.30, "scale_pop")

def composite_frame_fast(bgr_1080: np.ndarray, raw_t: float) -> np.ndarray:
    frame = bgr_1080.copy()
    frame[1695:1771, 860:936] = frame[1695:1771, 775:851]
    render_onto_frame_bgr(frame, raw_t)

    for ft in [0.12, 9.98, 22.16, 41.10, 50.00, 56.24, 60.14]:
        if 0.0 <= (raw_t - ft) <= 0.12:
            fl = int(70 * (1.0 - (raw_t - ft) / 0.12))
            frame = cv2.add(frame, np.full_like(frame, fl))
            break
    return frame

def build_audio_with_sms_ding(fps, frame_schedule):
    """
    Builds the edited audio track and injects an authentic, crystal-clear iOS Tri-Tone / Glass SMS
    Notification Chime right at t=0.04s when the SMS popup appears!
    """
    raw_wav = f"{INTER_DIR}/raw_44k.wav"
    if not os.path.exists(raw_wav):
        subprocess.run([
            "ffmpeg", "-y", "-i", VIDEO_PATH, "-vn", "-ac", "2", "-ar", "44100", raw_wav
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    sr, audio = wav.read(raw_wav)
    audio_f = audio.astype(np.float32) / 32768.0
    pieces = []
    fade_len = int(0.045 * sr)
    raw_to_out_time = []
    cur_out_s = 0.0

    for f_start, f_end, seg_lbl in frame_schedule:
        t_s = f_start / fps
        t_e = (f_end + 1) / fps
        s_idx = int(round(t_s * sr))
        e_idx = int(round(t_e * sr))
        chunk = audio_f[s_idx:e_idx].copy()
        if len(chunk) > fade_len * 2:
            fi = (0.5 - 0.5 * np.cos(np.linspace(0, math.pi, fade_len)))[:, None]
            fo = (0.5 + 0.5 * np.cos(np.linspace(0, math.pi, fade_len)))[:, None]
            chunk[:fade_len] *= fi
            chunk[-fade_len:] *= fo
        raw_to_out_time.append((t_s, t_e, cur_out_s))
        cur_out_s += len(chunk) / sr
        pieces.append(chunk)

    full_audio = np.concatenate(pieces, axis=0)
    total_samples = len(full_audio)
    sfx = np.zeros_like(full_audio)

    # 1. AUTHENTIC iOS SMS NOTIFICATION SOUND ("Tri-Tone / Note Ding") AT t = 0.04s
    # Note 1: B5 (987.77 Hz) at 0.04s, Note 2: D#6 (1244.51 Hz) at 0.17s, Note 3: F#6 (1479.98 Hz) at 0.30s
    # (Occurs during the 0.12s -> 0.80s pointing window before the speaker starts talking at 0.80s!)
    sms_notes = [
        (0.04, 987.77, 0.28, 0.36),
        (0.16, 1244.51, 0.28, 0.38),
        (0.28, 1479.98, 0.48, 0.42),
    ]
    for start_s, freq_hz, dur_s, gain in sms_notes:
        idx = int(start_s * sr)
        n = int(dur_s * sr)
        if idx + n < total_samples:
            t = np.linspace(0, dur_s, n)
            # Crisp bell attack (3ms) + warm glass fundamental & 2nd/3rd harmonics
            attack = np.clip(t / 0.003, 0.0, 1.0)
            decay = np.exp(-9.5 * t)
            bell = (
                0.72 * np.sin(2 * math.pi * freq_hz * t)
                + 0.20 * np.sin(2 * math.pi * (freq_hz * 2.0) * t) * np.exp(-16.0 * t)
                + 0.08 * np.sin(2 * math.pi * (freq_hz * 3.0) * t) * np.exp(-25.0 * t)
            )
            wave = bell * attack * decay * gain
            sfx[idx:idx + n, 0] += wave
            sfx[idx:idx + n, 1] += wave

    def map_raw_t(rt):
        for rs, re, os_t in raw_to_out_time:
            if rs - 0.05 <= rt <= re + 0.05:
                return os_t + max(0.0, rt - rs)
        return None

    def add_pop(raw_time, freq=640.0, gain=0.12):
        ot = map_raw_t(raw_time)
        if ot is None:
            return
        idx = int(ot * sr)
        n = int(0.065 * sr)
        if idx + n >= total_samples:
            return
        t = np.linspace(0, 0.065, n)
        f_env = freq * np.exp(-18 * t) + 180
        w_sig = np.sin(2 * math.pi * np.cumsum(f_env) / sr) * np.exp(-38 * t) * gain
        sfx[idx:idx + n, 0] += w_sig
        sfx[idx:idx + n, 1] += w_sig

    def add_tick(raw_time, gain=0.10):
        ot = map_raw_t(raw_time)
        if ot is None:
            return
        idx = int(ot * sr)
        n = int(0.025 * sr)
        if idx + n >= total_samples:
            return
        t = np.linspace(0, 0.025, n)
        w_sig = np.sin(2 * math.pi * 1850 * t) * np.exp(-110 * t) * gain
        sfx[idx:idx + n, 0] += w_sig
        sfx[idx:idx + n, 1] += w_sig

    for pt in [0.78, 3.30, 4.30, 6.45, 10.12, 13.50, 16.00, 17.80,
               24.15, 26.05, 27.80, 29.55, 31.05, 33.40, 36.10, 37.85,
               41.20, 42.30, 43.50, 46.20, 50.80, 53.25, 56.24, 60.14, 65.40]:
        add_pop(pt)

    for tk in np.arange(56.25, 59.35, 0.25):
        add_tick(tk)

    mixed = np.clip(full_audio + sfx, -0.98, 0.98)
    out_wav = f"{INTER_DIR}/edited_audio_opt2.wav"
    wav.write(out_wav, sr, (mixed * 32767.0).astype(np.int16))
    return out_wav

def main():
    t0 = time.time()
    cap = cv2.VideoCapture(VIDEO_PATH)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_raw_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()

    frame_schedule = []
    keep_map = {}
    for s_sec, e_sec, lbl in SEGMENTS:
        f_s = max(0, int(round(s_sec * fps)))
        f_e = min(total_raw_frames - 1, int(round(e_sec * fps)))
        frame_schedule.append((f_s, f_e, lbl))
        for f_i in range(f_s, f_e + 1):
            keep_map[f_i] = lbl

    max_keep_frame = max(keep_map.keys())
    total_out = len(keep_map)
    out_wav = build_audio_with_sms_ding(fps, frame_schedule)

    print("Pre-warming Option 2 caches...")
    dummy = np.zeros((H, W, 3), dtype=np.uint8)
    for test_t in [0.8, 4.5, 8.5, 11.0, 16.5, 20.0, 23.0, 39.0, 46.5, 49.0, 54.0, 57.5, 62.0, 67.0]:
        composite_frame_fast(dummy, test_t)
    print(f"Caches warmed in {time.time()-t0:.1f}s! Rendering {total_out} frames...")

    dec_cmd = [
        "ffmpeg", "-threads", "4", "-i", VIDEO_PATH,
        "-vf", f"scale={W}:{H}:flags=fast_bilinear",
        "-f", "rawvideo", "-pix_fmt", "bgr24", "-"
    ]
    dec_proc = subprocess.Popen(dec_cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

    enc_cmd = [
        "ffmpeg", "-y", "-threads", "4",
        "-f", "rawvideo", "-vcodec", "rawvideo",
        "-s", f"{W}x{H}", "-pix_fmt", "bgr24", "-r", f"{fps:.6f}",
        "-i", "-", "-i", out_wav,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
        "-shortest", "-movflags", "+faststart",
        FINAL_MP4
    ]
    enc_proc = subprocess.Popen(enc_cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    frame_bytes = W * H * 3
    rendered = 0
    for f_idx in range(max_keep_frame + 1):
        raw_buf = dec_proc.stdout.read(frame_bytes)
        if len(raw_buf) < frame_bytes:
            break
        if f_idx in keep_map:
            bgr_1080 = np.frombuffer(raw_buf, dtype=np.uint8).reshape((H, W, 3))
            raw_t = f_idx / fps
            out_bgr = composite_frame_fast(bgr_1080, raw_t)
            enc_proc.stdin.write(out_bgr.tobytes())
            rendered += 1
            if rendered % 300 == 0 or rendered == total_out:
                print(f"  [{time.time()-t0:5.1f}s] Rendered {rendered}/{total_out} ({rendered*100.0/total_out:.1f}%)")
            if abs(raw_t - 39.00) < 0.03:
                cv2.imwrite(f"{INTER_DIR}/preview_opt2_scene3.jpg", cv2.resize(out_bgr, (540, 960)))
            elif abs(raw_t - 54.50) < 0.03:
                cv2.imwrite(f"{INTER_DIR}/preview_opt2_scene5a.jpg", cv2.resize(out_bgr, (540, 960)))

    dec_proc.stdout.close()
    dec_proc.terminate()
    enc_proc.stdin.close()
    enc_proc.wait()
    print(f"SUCCESS! Rendered {FINAL_MP4} in {time.time()-t0:.1f}s")

if __name__ == "__main__":
    main()
