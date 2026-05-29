import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { CvJson } from "@/types";
import { parseBullets, hasItems } from "@/lib/cv-helpers";
import path from "path";

const FONTS_DIR = path.join(process.cwd(), "public/fonts");

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(FONTS_DIR, "Inter-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONTS_DIR, "Inter-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(FONTS_DIR, "Inter-Bold.ttf"), fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 8,
    lineHeight: 1.5,
    color: "#1a1a2e",
    backgroundColor: "#ffffff",
  },
  /* ── Top accent stripes (rhythmic prelude) ── */
  topStripe: { height: 3 },
  stripeTwo: { height: 2 },
  stripeThree: { height: 1.5 },
  /* ── Header (relative parent for absolute layers) ── */
  headerBar: { position: "relative", overflow: "hidden" },
  /* Decoration layer — absolute, behind content */
  headerDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  /* Content layer — absolute, on top of decoration */
  headerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTextBlock: { flex: 1, paddingRight: 20 },
  name: {
    fontSize: 32,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 14,
    letterSpacing: -0.6,
    lineHeight: 1.05,
  },
  headline: {
    fontSize: 11.5,
    fontWeight: 400,
    color: "#ffffffcc",
    letterSpacing: 0.3,
    lineHeight: 1.35,
  },
  headerPhoto: {
    objectFit: "cover",
    border: "3pt solid #ffffff40",
  },
  /* ── Accent rule below header ── */
  accentRule: { height: 4 },
  /* ── Body ── */
  body: {
    padding: "14pt 28pt 10pt 28pt",
    flexDirection: "row",
    gap: 24,
  },
  /* ── Left accent bar (vertical Canva-style sidebar stripe) ── */
  leftAccentBar: { width: 3 },
  leftColumn: { width: "32%", paddingLeft: 10 },
  rightColumn: { width: "68%" },
  /* ── Section heading ── */
  section: { marginBottom: 10 },
  sectionHeading: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 2.5,
    borderLeftStyle: "solid",
    lineHeight: 1.3,
  },
  /* ── Section divider (subtle thin rule) ── */
  sectionDivider: {
    height: 1,
    marginBottom: 6,
  },
  /* ── Left column items ── */
  contactGroup: { marginBottom: 5 },
  contactLabel: {
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: 6.5,
    letterSpacing: 0.9,
    marginBottom: 1,
    lineHeight: 1.2,
  },
  contactValue: {
    fontSize: 7.5,
    lineHeight: 1.35,
  },
  skillListWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  skillPill: {
    fontSize: 7.5,
    padding: "3pt 9pt",
    borderRadius: 12,
    fontWeight: 600,
    lineHeight: 1.3,
  },
  langItem: {
    fontSize: 7.5,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  certItem: {
    fontSize: 7.5,
    marginBottom: 3,
    lineHeight: 1.4,
    paddingLeft: 2,
  },
  /* ── Right column items ── */
  item: { marginBottom: 8 },
  itemTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  itemSubtitle: {
    fontSize: 8.5,
    fontWeight: 500,
    marginBottom: 1,
    lineHeight: 1.3,
  },
  itemDate: {
    fontSize: 7.5,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  summary: {
    fontSize: 8,
    lineHeight: 1.45,
    marginBottom: 2,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 2,
  },
  bulletMarker: {
    width: 12,
    fontWeight: 700,
    lineHeight: 1.4,
  },
  bulletText: { flex: 1, fontSize: 7.5, lineHeight: 1.4 },
  /* ── Footer ── */
  footer: {
    position: "absolute",
    bottom: 8,
    right: 28,
    left: 28,
    alignItems: "center",
  },
  footerText: { fontSize: 6.5 },
});

interface CvTemplateProps {
  data: CvJson;
  photoUrl?: string;
  fullName?: string;
  headline?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  location?: string;
  accentColor?: string;
  fontScale?: number;
}

export function CvTemplateModern({
  data,
  photoUrl,
  fullName,
  headline,
  email,
  phone,
  linkedinUrl,
  location,
  accentColor,
  fontScale = 1,
}: CvTemplateProps) {
  const sections = data.sections || [];
  const sc = fontScale ?? 1;
  function s(b: number) {
    return Math.round(b * sc * 10) / 10;
  }

  const t = {
    ...styles,
    page: { ...styles.page, fontSize: s(8) },
    name: { ...styles.name, fontSize: s(32) },
    headline: { ...styles.headline, fontSize: s(11.5) },
    sectionHeading: { ...styles.sectionHeading, fontSize: s(8) },
    contactLabel: { ...styles.contactLabel, fontSize: s(6.5) },
    contactValue: { ...styles.contactValue, fontSize: s(7.5) },
    skillPill: { ...styles.skillPill, fontSize: s(7.5) },
    langItem: { ...styles.langItem, fontSize: s(7.5) },
    certItem: { ...styles.certItem, fontSize: s(7.5) },
    itemTitle: { ...styles.itemTitle, fontSize: s(9.5) },
    itemSubtitle: { ...styles.itemSubtitle, fontSize: s(8.5) },
    itemDate: { ...styles.itemDate, fontSize: s(7.5) },
    bulletMarker: { ...styles.bulletMarker, fontSize: s(8) },
    bulletText: { ...styles.bulletText, fontSize: s(7.5) },
    summary: { ...styles.summary, fontSize: s(8) },
    footerText: { ...styles.footerText, fontSize: s(6.5) },
  } as typeof styles;

  const accent = accentColor || "#6c5ce7";
  const accentBg = accent + "14";
  const accentFaint = accent + "08";
  const mutedColor = "#7c7c9e";
  const darkColor = "#1a1a2e";
  const midColor = "#3d3d5c";

  const summarySec = sections.find((s: any) => s.type === "summary");
  const experienceSec = sections.find((s: any) => s.type === "experience");
  const educationSec = sections.find((s: any) => s.type === "education");
  const skillsSec = sections.find((s: any) => s.type === "skills");
  const certSec = sections.find((s: any) => s.type === "certifications");
  const langSec = sections.find((s: any) => s.type === "languages");
  const contactSec = sections.find((s: any) => s.type === "contact");
  const linkedinSec = sections.find((s: any) => s.type === "linkedinNote");

  const contactItems: Array<{ label: string; value: string }> = [];
  if (email) contactItems.push({ label: "Email", value: email });
  if (phone) contactItems.push({ label: "Phone", value: phone });
  if (location) contactItems.push({ label: "Location", value: location });
  if (linkedinUrl) contactItems.push({ label: "LinkedIn", value: linkedinUrl });

  const displayName = fullName || "Your Name";
  const displayHeadline = headline || "";

  const isSparse = sc > 1.2;
  const sectionMb = isSparse ? s(14) : s(10);
  const bodyPaddingV = isSparse ? s(18) : s(14);
  const photoSize = isSparse ? s(112) : s(96);
  const headerPad = isSparse ? s(26) : s(22);
  const headerPadBtm = isSparse ? s(20) : s(18);

  const sectionHeadingStyle = {
    ...t.sectionHeading,
    color: accent,
    borderLeftColor: accent,
  };

  return (
    <Document>
      <Page size="A4" style={t.page}>
        {/* ── Top accent stripes: rhythmic visual prelude ── */}
        <View style={[t.topStripe, { backgroundColor: accent }]} />
        <View style={[t.stripeTwo, { backgroundColor: accent + "33" }]} />
        <View style={[t.stripeThree, { backgroundColor: accent + "14" }]} />

        {/* ── Header: two absolute layers, decoration behind text ── */}
        {/* Height: photo + padding + breathing room */}
        <View
          style={[
            t.headerBar,
            {
              backgroundColor: accent,
              height: photoSize + headerPad + headerPadBtm + s(2),
            },
          ]}
        >
          {/* Layer 1 — Decorative shapes (absolute, first in DOM = behind) */}
          <View style={t.headerDecoration}>
            {/* Large accent circle, top-right */}
            <View
              style={{
                position: "absolute",
                top: -s(20),
                right: s(60),
                width: s(56),
                height: s(56),
                borderRadius: s(28),
                backgroundColor: accent + "18",
              }}
            />
            {/* Medium circle, bottom-left */}
            <View
              style={{
                position: "absolute",
                bottom: -s(14),
                left: -s(16),
                width: s(52),
                height: s(52),
                borderRadius: s(26),
                backgroundColor: accent + "0c",
              }}
            />
            {/* Thin accent bar, bottom-third */}
            <View
              style={{
                position: "absolute",
                bottom: s(6),
                left: "15%",
                width: s(100),
                height: s(3),
                borderRadius: s(2),
                backgroundColor: accent + "1e",
              }}
            />
            {/* Small dot, mid-left */}
            <View
              style={{
                position: "absolute",
                top: "40%",
                left: s(14),
                width: s(6),
                height: s(6),
                borderRadius: s(3),
                backgroundColor: accent + "14",
              }}
            />
          </View>

          {/* Layer 2 — Content (absolute, second in DOM = on top) */}
          <View
            style={[
              t.headerContent,
              {
                paddingTop: headerPad,
                paddingBottom: headerPadBtm,
                paddingLeft: s(28),
                paddingRight: s(28),
              },
            ]}
          >
            <View style={t.headerTextBlock}>
              <Text style={[t.name, { marginBottom: s(14) }]}>
                {displayName}
              </Text>
              {displayHeadline ? (
                <Text style={t.headline}>{displayHeadline}</Text>
              ) : null}
            </View>
            {photoUrl ? (
              <Image
                src={photoUrl}
                style={[
                  t.headerPhoto,
                  {
                    width: photoSize,
                    height: photoSize,
                    borderRadius: photoSize / 2,
                  },
                ]}
              />
            ) : null}
          </View>
        </View>

        {/* ── Accent rule below header ── */}
        <View style={[t.accentRule, { backgroundColor: accent }]} />

        {/* Body: left accent bar + content */}
        <View
          style={[
            t.body,
            {
              paddingTop: bodyPaddingV,
              paddingBottom: bodyPaddingV,
            },
          ]}
        >
          {/* Left accent bar (Canva-style sidebar stripe) */}
          <View style={[t.leftAccentBar, { backgroundColor: accent }]} />

          {/* Left column */}
          <View style={t.leftColumn}>
            {contactItems.length > 0 && (
              <View style={[t.section, { marginBottom: sectionMb }]}>
                <Text style={sectionHeadingStyle}>Contact</Text>
                {contactItems.map((item, i) => (
                  <View key={i} style={t.contactGroup}>
                    <Text style={[t.contactLabel, { color: accent }]}>
                      {item.label}
                    </Text>
                    <Text style={[t.contactValue, { color: darkColor }]}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {hasItems(contactSec) &&
              contactItems.length === 0 && (
                <View style={[t.section, { marginBottom: sectionMb }]}>
                  <Text style={sectionHeadingStyle}>
                    {contactSec.heading || "Contact"}
                  </Text>
                  {contactSec.items.map((item, i) => {
                    if (typeof item === "string") {
                      return (
                        <Text key={i} style={[t.contactValue, { color: darkColor }]}>
                          {item}
                        </Text>
                      );
                    }
                    const label = item.subtitle || "";
                    const value = item.title || "";
                    return (
                      <View key={i} style={t.contactGroup}>
                        {label ? (
                          <Text style={[t.contactLabel, { color: accent }]}>
                            {label}
                          </Text>
                        ) : null}
                        <Text style={[t.contactValue, { color: darkColor }]}>
                          {value}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

            {hasItems(skillsSec) && (
              <View style={[t.section, { marginBottom: sectionMb }]}>
                <Text style={sectionHeadingStyle}>
                  {skillsSec.heading || "Skills"}
                </Text>
                <View style={t.skillListWrap}>
                  {skillsSec.items.map((item, i) => (
                    <Text
                      key={i}
                      style={[t.skillPill, { color: accent, backgroundColor: accentBg }]}
                    >
                      {typeof item === "string" ? item : item.title || ""}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {hasItems(langSec) && (
              <View style={[t.section, { marginBottom: sectionMb }]}>
                <Text style={sectionHeadingStyle}>
                  {langSec.heading || "Languages"}
                </Text>
                {langSec.items.map((item: any, i: number) => (
                  <Text key={i} style={[t.langItem, { color: darkColor }]}>
                    {typeof item === "string" ? item : item.title || ""}
                  </Text>
                ))}
              </View>
            )}

            {hasItems(certSec) && (
              <View style={[t.section, { marginBottom: sectionMb }]}>
                <Text style={sectionHeadingStyle}>
                  {certSec.heading || "Certifications"}
                </Text>
                {certSec.items.map((item: any, i: number) => (
                  <Text key={i} style={[t.certItem, { color: darkColor }]}>
                    {typeof item === "string" ? item : item.title || ""}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Right column */}
          <View style={t.rightColumn}>
            {hasItems(summarySec) && (
              <View style={[t.section, { marginBottom: sectionMb }]}>
                <Text style={sectionHeadingStyle}>
                  {summarySec.heading || "Professional Summary"}
                </Text>
                {summarySec.items.map((item: any, i: number) => (
                  <Text key={i} style={[t.summary, { color: midColor }]}>
                    {typeof item === "string" ? item : ""}
                  </Text>
                ))}
              </View>
            )}

            {hasItems(experienceSec) && (
              <View style={[t.section, { marginBottom: sectionMb }]}>
                <Text style={sectionHeadingStyle}>
                  {experienceSec.heading || "Experience"}
                </Text>
                {experienceSec.items.map((item: any, i: number) => {
                  if (typeof item === "string") {
                    return (
                      <Text key={i} style={[t.summary, { color: midColor }]}>
                        {item}
                      </Text>
                    );
                  }
                  const bullets = item.description
                    ? parseBullets(item.description)
                    : [];
                  return (
                    <View
                      key={i}
                      style={[t.item, { marginBottom: isSparse ? s(12) : s(8) }]}
                    >
                      <Text style={[t.itemTitle, { color: darkColor }]}>
                        {item.title || ""}
                      </Text>
                      {item.subtitle ? (
                        <Text style={[t.itemSubtitle, { color: accent }]}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                      {item.date ? (
                        <Text style={[t.itemDate, { color: mutedColor }]}>
                          {item.date}
                        </Text>
                      ) : null}
                      {bullets.map((b: string, bi: number) => (
                        <View key={bi} style={t.bullet}>
                          <Text style={[t.bulletMarker, { color: accent }]}>
                            ▸
                          </Text>
                          <Text style={[t.bulletText, { color: midColor }]}>
                            {b}
                          </Text>
                        </View>
                      ))}
                      {/* Subtle divider between experience items */}
                      {i < experienceSec.items.length - 1 ? (
                        <View
                          style={[
                            t.sectionDivider,
                            { backgroundColor: accentFaint, marginTop: s(6) },
                          ]}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}

            {hasItems(educationSec) && (
              <View style={[t.section, { marginBottom: sectionMb }]}>
                <Text style={sectionHeadingStyle}>
                  {educationSec.heading || "Education"}
                </Text>
                {educationSec.items.map((item: any, i: number) => {
                  if (typeof item === "string") {
                    return (
                      <Text key={i} style={[t.summary, { color: midColor }]}>
                        {item}
                      </Text>
                    );
                  }
                  return (
                    <View
                      key={i}
                      style={[t.item, { marginBottom: isSparse ? s(12) : s(8) }]}
                    >
                      <Text style={[t.itemTitle, { color: darkColor }]}>
                        {item.title || ""}
                      </Text>
                      {item.subtitle ? (
                        <Text style={[t.itemSubtitle, { color: accent }]}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                      {item.date ? (
                        <Text style={[t.itemDate, { color: mutedColor }]}>
                          {item.date}
                        </Text>
                      ) : null}
                      {item.description ? (
                        <Text style={[t.bulletText, { color: midColor }]}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        {linkedinSec && linkedinSec.items.length > 0 && (
          <View style={t.footer}>
            {linkedinSec.items.map((item: any, i: number) => (
              <Text key={i} style={[t.footerText, { color: "#9ca3af" }]}>
                {typeof item === "string" ? item : item.title || ""}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
