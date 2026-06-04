// ORACLE TERMINAL — Parametric OpenSCAD Model v5
// Centered Coordinate System & Tapered Inclined Wedge Body
// Component Layout: Speaker + Knob on Right; Vents + LED Stripe on Left
// No.6 Gemini — 2026-06-04

$fn = 64;

// ─── PARAMETERS ──────────────────────────────────
W_base  = 100;     // Width at base (x)
W_top   = 88;      // Width at top (x)
D_base  = 90;      // Depth at base (y)
H_front = 110;     // Front height (z)
H_back  = 83;      // Back height (z)
LEAN    = 16.0;    // Front lean angle (degrees)
T       = 2.0;     // Wall thickness
R       = 8;       // Corner radius

// Incline slope calculation (K) for Y-offset on front face
K = 0.2872;
function yface(z) = -47.3 + K * z;

// Helper to place children on the inclined front face
module onface(zc, out=0) {
    translate([0, yface(zc) - out * cos(LEAN), zc + out * sin(LEAN)])
        rotate([90 - LEAN, 0, 0])
            children();
}

// Side face taper angle (width taper)
TAPER_ANGLE = 3.65;

// Helper to place children on the right face
module onright(zc, yc, out=0) {
    w_h = W_base/2 - (W_base - W_top)/2 * (zc / (H_front - R));
    translate([w_h + out, yc, zc])
        rotate([0, 90 + TAPER_ANGLE, 0])
            children();
}

// Helper to place children on the left face
module onleft(zc, yc, out=0) {
    w_h = W_base/2 - (W_base - W_top)/2 * (zc / (H_front - R));
    translate([-w_h - out, yc, zc])
        rotate([0, -90 - TAPER_ANGLE, 0])
            children();
}

// ─── COLORS ──────────────────────────────────────
SHELL  = [0.83, 0.78, 0.66];
SCREEN = [0.05, 0.06, 0.07];
GLOW   = [0.0, 1.0, 0.5];
ORG    = [0.97, 0.55, 0.12];
DARK   = [0.15, 0.15, 0.16];
BEZEL  = [0.40, 0.38, 0.34];

// ─── CORE SOLID MODEL ────────────────────────────
module terminal_solid(w_base, w_top, d, h_front, h_back, r) {
    hull() {
        // Bottom Front Left/Right
        translate([-w_base/2 + r, -d/2 + r, r]) sphere(r=r);
        translate([ w_base/2 - r, -d/2 + r, r]) sphere(r=r);
        // Bottom Back Left/Right
        translate([-w_base/2 + r,  d/2 - r, r]) sphere(r=r);
        translate([ w_base/2 - r,  d/2 - r, r]) sphere(r=r);
        
        // Top Front Left/Right
        translate([-w_top/2 + r,  -18 + r, h_front - r]) sphere(r=r);
        translate([ w_top/2 - r,  -18 + r, h_front - r]) sphere(r=r);
        // Top Back Left/Right
        translate([-w_top/2 + r,   34 - r, h_back - r]) sphere(r=r);
        translate([ w_top/2 - r,   34 - r, h_back - r]) sphere(r=r);
    }
}

module body_shell() {
    color(SHELL) difference() {
        terminal_solid(W_base, W_top, D_base, H_front, H_back, R);
        
        // Inner hollow cavity
        translate([0, 0, T])
            terminal_solid(W_base - 2*T, W_top - 2*T, D_base - 2*T, H_front - 2*T, H_back - 2*T, R - T);
        
        // Subtract cutouts
        screen_cut();
        speaker_cut();
        knob_cut();
        vents_cut();
        ports_cut();
    }
}

// ─── CUTOUTS & FEATURES ──────────────────────────
module screen_cut() {
    onface(62, -0.1)
        cube([84.0, 60.0, T + 0.2], center=true);
}

module screen_panel() {
    color(BEZEL)
        onface(62, 0.5)
            cube([84.0, 60.0, 2.0], center=true);
    
    color(SCREEN)
        onface(62, 1.2)
            cube([73.4, 49.0, 1.0], center=true);
}

module face_glow() {
    color(GLOW) {
        // Left Eye (rounded 12x14 box hint)
        for(ex=[-14, 14])
            onface(70, 1.8)
                translate([ex, 0, 0])
                    linear_extrude(1.0)
                        offset(r=2.6) offset(r=-2.6)
                            square([12, 14], center=true);
        
        // Mouth (5 dotted cylinders)
        for(i=[-2:2])
            onface(48, 1.8)
                translate([i*7, 0, 0])
                    cylinder(d=3.4, h=1.0);
    }
}

module oracle_word() {
    color([0.2, 0.18, 0.13])
        onface(24, 1.6)
            linear_extrude(1.0)
                text("ARRA ORACLE", size=8, halign="center", valign="center", font="Liberation Sans:style=Bold");
}

module front_badge() {
    color([0.28, 0.26, 0.2])
        onface(95, 1.2)
            linear_extrude(0.8)
                text("ORC-T01-01", size=4, halign="center", valign="center", font="Liberation Sans");
}

module speaker_cut() {
    onright(68, -10, -3)
        cylinder(d=34, h=6);
}

module speaker() {
    color(DARK)
        onright(68, -10, 0.2)
            cylinder(d=33, h=1.5);
    
    color([0.05, 0.05, 0.05])
        onright(68, -10, 1.0)
            for(r = [3 : 3 : 15])
                difference() {
                    cylinder(r=r+0.5, h=0.8);
                    cylinder(r=r-0.5, h=1.0);
                }
}

module knob_cut() {
    onright(32, -10, -3)
        cylinder(d=21, h=6);
}

module knob() {
    color(DARK)
        onright(32, -10, 0.2) {
            cylinder(d=20, h=8);
            color([0.9, 0.9, 0.9])
                translate([0, 7, 7.2])
                    cube([2, 4, 1.2], center=true);
        }
}

module vents_cut() {
    for(i=[0:5]) {
        onleft(50, -25 + i * 7, -3)
            linear_extrude(6)
                offset(r=0.8) offset(r=-0.8)
                    square([32, 2.4], center=true);
    }
}

module accent() {
    color(ORG)
        onleft(65, 12, 0.4)
            linear_extrude(1.5)
                offset(r=1.2) offset(r=-1.2)
                    square([46, 4.0], center=true);
}

module ports_cut() {
    translate([-10, D_base/2 - 3, 13])
        rotate([78, 0, 0])
            linear_extrude(8)
                offset(r=1.5) offset(r=-1.5)
                    square([11, 5], center=true);
    
    translate([12, D_base/2 - 3, 13])
        rotate([78, 0, 0])
            linear_extrude(8)
                offset(r=1.0) offset(r=-1.0)
                    square([13, 3.6], center=true);
}

module feet() {
    color(DARK)
        for(sx=[-1,1], sy=[-1,1])
            translate([sx * (W_base/2 - 15), sy * (D_base/2 - 15), -2])
                cylinder(d=12, h=4);
}

// ─── ASSEMBLY ────────────────────────────────────
module assembled() {
    body_shell();
    screen_panel();
    face_glow();
    oracle_word();
    front_badge();
    speaker();
    knob();
    accent();
    feet();
}

// ─── RENDER ──────────────────────────────────────
ROTATION = 0;
rotate([0, 0, ROTATION]) assembled();
