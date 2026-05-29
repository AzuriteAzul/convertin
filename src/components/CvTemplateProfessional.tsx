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
    color: "#1a202c",
    backgroundColor: "#ffffff",
  },
  /* ── Header Bar ── */
  headerBar: {
    padding: "18pt 28pt 14pt 28pt",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextBlock: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 22,
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 11,
    fontWeight: 400,
    color: "#ffffffcc",
    letterSpacing: 0.2,
  },
  headerPhoto: {
    width: 88,
    height: 88,
    borderRadius: 44,
    objectFit: "cover",
    marginLeft: 18,
    border: "2pt solid #ffffff30",
  },
  /* ── Contact strip ── */
  contactStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    padding: "6pt 28pt",
    gap: 10,
  },
  contactItem: {
    fontSize: 7.5,
    color: "#4a5568",
    lineHeight: 1.3,
  },
  contactDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#a0aec0",
  },
  /* ── Body ── */
  body: {
    padding: "10pt 28pt 12pt 28pt",
  },
  section: {
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1.5,
    borderBottomStyle: "solid",
  },
  item: {
    marginBottom: 6,
    paddingLeft: 2,
  },
  itemTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#1a202c",
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
    color: "#718096",
    marginBottom: 2,
    lineHeight: 1.3,
  },
  itemDesc: {
    fontSize: 7.5,
    lineHeight: 1.4,
    color: "#4a5568",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 10,
    fontSize: 7.5,
    lineHeight: 1.4,
  },
  bulletText: {
    flex: 1,
    fontSize: 7.5,
    lineHeight: 1.4,
    color: "#4a5568",
  },
  summary: {
    fontSize: 8,
    lineHeight: 1.45,
    color: "#4a5568",
    marginBottom: 2,
  },
  skillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillPill: {
    fontSize: 7.5,
    padding: "2pt 8pt",
    borderRadius: 10,
    fontWeight: 600,
  },
  /* ── Footer ── */
  footer: {
    position: "absolute",
    bottom: 8,
    right: 28,
    left: 28,
    alignItems: "center",
  },
  footerText: {
    fontSize: 6.5,
    color: "#9ca3af",
  },
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

function s(base: number, scale: number): number {
  return Math.round(base * scale * 10) / 10;
}

export function CvTemplateProfessional({
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

  const t = {
    ...styles,
    page: { ...styles.page, fontSize: s(8, sc) },
    name: { ...styles.name, fontSize: s(26, sc) },
    headline: { ...styles.headline, fontSize: s(11, sc) },
    contactItem: { ...styles.contactItem, fontSize: s(7.5, sc) },
    sectionHeading: { ...styles.sectionHeading, fontSize: s(9, sc) },
    itemTitle: { ...styles.itemTitle, fontSize: s(9, sc) },
    itemSubtitle: { ...styles.itemSubtitle, fontSize: s(8.5, sc) },
    itemDate: { ...styles.itemDate, fontSize: s(7.5, sc) },
    itemDesc: { ...styles.itemDesc, fontSize: s(7.5, sc) },
    bulletDot: { ...styles.bulletDot, fontSize: s(7.5, sc) },
    bulletText: { ...styles.bulletText, fontSize: s(7.5, sc) },
    summary: { ...styles.summary, fontSize: s(8, sc) },
    skillPill: { ...styles.skillPill, fontSize: s(7.5, sc) },
    footerText: { ...styles.footerText, fontSize: s(6.5, sc) },
  } as typeof styles;

  const accent = accentColor || "#1a365d";
  const darkColor = "#1a202c";
  const accentLight = accent + "dd";
  const accentBg = accent + "12";

  const summarySection = sections.find((s) => s.type === "summary");
  const experienceSection = sections.find((s) => s.type === "experience");
  const educationSection = sections.find((s) => s.type === "education");
  const skillsSection = sections.find((s) => s.type === "skills");
  const certSection = sections.find((s) => s.type === "certifications");
  const langSection = sections.find((s) => s.type === "languages");
  const contactSection = sections.find((s) => s.type === "contact");
  const linkedinNoteSection = sections.find((s) => s.type === "linkedinNote");

  const displayName = fullName || "Your Name";
  const displayHeadline = headline || "";

  const contactItems: Array<{ label: string; value: string }> = [];
  if (email) contactItems.push({ label: email, value: email });
  if (phone) contactItems.push({ label: phone, value: phone });
  if (location) contactItems.push({ label: location, value: location });
  if (linkedinUrl) contactItems.push({ label: linkedinUrl, value: linkedinUrl });

  // Sparse adjustments
  const isSparse = sc > 1.2;
  const sectionMarginBottom = isSparse ? s(14, sc) : s(10, sc);
  const bodyPaddingVertical = isSparse ? s(16, sc) : s(10, sc);
  const photoSize = isSparse ? s(104, sc) : s(88, sc);
  const itemMarginBottom = isSparse ? s(10, sc) : s(6, sc);

  return (
    <Document>
      <Page size="A4" style={t.page}>
        {/* ── Header Bar ── */}
        <View style={[t.headerBar, { backgroundColor: accent }]}>
          <View style={t.headerTextBlock}>
            <Text style={[t.name, { marginBottom: s(22, sc) }]}>{displayName}</Text>
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

        {/* ── Contact Strip ── */}
        {(contactItems.length > 0 || hasItems(contactSection)) && (
          <View style={[t.contactStrip, { backgroundColor: accent + "0a" }]}>
            {contactItems.length > 0 ? (
              contactItems.map((item, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={[t.contactItem, { fontWeight: 600, color: accent }]}>
                    {item.label}
                  </Text>
                  {i < contactItems.length - 1 && (
                    <View style={t.contactDivider} />
                  )}
                </View>
              ))
            ) : (
              hasItems(contactSection) &&
              contactSection.items.map((item, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={t.contactItem}>
                    {typeof item === "string" ? item : item.title || ""}
                  </Text>
                  {i < contactSection.items.length - 1 && (
                    <View style={t.contactDivider} />
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* ── Body ── */}
        <View
          style={[
            t.body,
            { paddingTop: bodyPaddingVertical, paddingBottom: bodyPaddingVertical },
          ]}
        >
          {/* ── Summary ── */}
          {hasItems(summarySection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text
                style={[
                  t.sectionHeading,
                  { color: accent, borderBottomColor: darkColor },
                ]}
              >
                {summarySection.heading || "Professional Summary"}
              </Text>
              {summarySection.items.map((item, i) => (
                <Text key={i} style={t.summary}>
                  {typeof item === "string" ? item : ""}
                </Text>
              ))}
            </View>
          )}

          {/* ── Experience ── */}
          {hasItems(experienceSection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text
                style={[
                  t.sectionHeading,
                  { color: accent, borderBottomColor: darkColor },
                ]}
              >
                {experienceSection.heading || "Professional Experience"}
              </Text>
              {experienceSection.items.map((item, i) => {
                if (typeof item === "string") {
                  return (
                    <Text key={i} style={t.summary}>
                      {item}
                    </Text>
                  );
                }
                const bullets = item.description
                  ? parseBullets(item.description)
                  : [];
                return (
                  <View key={i} style={[t.item, { marginBottom: itemMarginBottom }]}>
                    <Text style={t.itemTitle}>{item.title || ""}</Text>
                    {item.subtitle ? (
                      <Text style={[t.itemSubtitle, { color: accent }]}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                    {item.date ? (
                      <Text style={t.itemDate}>{item.date}</Text>
                    ) : null}
                    {bullets.map((b, bi) => (
                      <View key={bi} style={t.bullet}>
                        <Text style={[t.bulletDot, { color: accentLight }]}>
                          —
                        </Text>
                        <Text style={t.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Education ── */}
          {hasItems(educationSection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text
                style={[
                  t.sectionHeading,
                  { color: accent, borderBottomColor: darkColor },
                ]}
              >
                {educationSection.heading || "Education"}
              </Text>
              {educationSection.items.map((item, i) => {
                if (typeof item === "string") {
                  return (
                    <Text key={i} style={t.summary}>
                      {item}
                    </Text>
                  );
                }
                return (
                  <View key={i} style={[t.item, { marginBottom: itemMarginBottom }]}>
                    <Text style={t.itemTitle}>{item.title || ""}</Text>
                    {item.subtitle ? (
                      <Text style={[t.itemSubtitle, { color: accent }]}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                    {item.date ? (
                      <Text style={t.itemDate}>{item.date}</Text>
                    ) : null}
                    {item.description ? (
                      <Text style={t.itemDesc}>{item.description}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Skills ── */}
          {hasItems(skillsSection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text
                style={[
                  t.sectionHeading,
                  { color: accent, borderBottomColor: darkColor },
                ]}
              >
                {skillsSection.heading || "Skills"}
              </Text>
              <View style={t.skillList}>
                {skillsSection.items.map((item, i) => (
                  <Text
                    key={i}
                    style={[
                      t.skillPill,
                      { color: accent, backgroundColor: accentBg },
                    ]}
                  >
                    {typeof item === "string" ? item : item.title || ""}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* ── Certifications ── */}
          {hasItems(certSection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text
                style={[
                  t.sectionHeading,
                  { color: accent, borderBottomColor: darkColor },
                ]}
              >
                {certSection.heading || "Certifications"}
              </Text>
              {certSection.items.map((item, i) => (
                <View
                  key={i}
                  style={[
                    t.item,
                    { marginBottom: itemMarginBottom, paddingLeft: 4 },
                  ]}
                >
                  {typeof item === "string" ? (
                    <Text style={t.summary}>{item}</Text>
                  ) : (
                    <>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "baseline",
                        }}
                      >
                        <Text style={{ ...t.itemTitle, flex: 1 }}>
                          {item.title || ""}
                        </Text>
                        {item.date ? (
                          <Text style={t.itemDate}>{item.date}</Text>
                        ) : null}
                      </View>
                      {item.subtitle ? (
                        <Text style={[t.itemSubtitle, { color: accent }]}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* ── Languages ── */}
          {hasItems(langSection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text
                style={[
                  t.sectionHeading,
                  { color: accent, borderBottomColor: darkColor },
                ]}
              >
                {langSection.heading || "Languages"}
              </Text>
              <View style={t.skillList}>
                {langSection.items.map((item, i) => (
                  <Text
                    key={i}
                    style={[
                      t.skillPill,
                      { color: accent, backgroundColor: accentBg },
                    ]}
                  >
                    {typeof item === "string" ? item : item.title || ""}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Footer ── */}
        {linkedinNoteSection && linkedinNoteSection.items.length > 0 && (
          <View style={t.footer}>
            {linkedinNoteSection.items.map((item, i) => (
              <Text key={i} style={t.footerText}>
                {typeof item === "string" ? item : item.title || ""}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
