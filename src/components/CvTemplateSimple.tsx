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

const GRAY_900 = "#111111";
const GRAY_700 = "#333333";
const GRAY_500 = "#666666";
const GRAY_300 = "#cccccc";
const GRAY_100 = "#f5f5f5";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 8,
    lineHeight: 1.5,
    color: GRAY_900,
    backgroundColor: "#ffffff",
  },
  /* ── Header ── */
  header: {
    padding: "28pt 36pt 0pt 36pt",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.6,
    color: GRAY_900,
    flex: 1,
    lineHeight: 1.15,
  },
  headerPhoto: {
    width: 76,
    height: 76,
    borderRadius: 38,
    objectFit: "cover",
    marginLeft: 16,
  },
  headline: {
    fontSize: 10.5,
    fontWeight: 400,
    color: GRAY_500,
    marginBottom: 2,
    letterSpacing: 0.2,
    lineHeight: 1.35,
  },
  thinSeparator: {
    borderBottom: `0.75pt solid ${GRAY_300}`,
    marginTop: 10,
    marginBottom: 12,
  },
  /* ── Body ── */
  body: {
    padding: "0pt 36pt 28pt 36pt",
  },
  /* ── Section ── */
  section: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 7.5,
    fontWeight: 600,
    color: GRAY_500,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  /* ── Items ── */
  item: {
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: GRAY_900,
    lineHeight: 1.3,
  },
  itemSubtitle: {
    fontSize: 8.5,
    fontWeight: 400,
    color: GRAY_700,
    marginBottom: 1,
    lineHeight: 1.3,
  },
  itemDate: {
    fontSize: 7.5,
    color: GRAY_500,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  itemDesc: {
    fontSize: 8,
    lineHeight: 1.45,
    color: GRAY_700,
  },
  summary: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: GRAY_700,
    marginBottom: 2,
  },
  /* ── Bullets ── */
  bullet: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 10,
    fontSize: 7.5,
    color: GRAY_500,
    lineHeight: 1.45,
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.45,
    color: GRAY_700,
  },
  /* ── Tags ── */
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    fontSize: 8,
    color: GRAY_700,
    lineHeight: 1.5,
  },
  tagSeparator: {
    fontSize: 8,
    color: GRAY_300,
    marginHorizontal: 4,
  },
  /* ── Contact ── */
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    rowGap: 2,
    marginBottom: 2,
  },
  contactItem: {
    fontSize: 7.5,
    color: GRAY_700,
    lineHeight: 1.4,
  },
  /* ── Footer ── */
  footer: {
    position: "absolute",
    bottom: 8,
    right: 36,
    left: 36,
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

export function CvTemplateSimple({
  data,
  photoUrl,
  fullName,
  headline,
  email,
  phone,
  linkedinUrl,
  location,
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
    name: { ...styles.name, fontSize: s(28) },
    headline: { ...styles.headline, fontSize: s(10.5) },
    sectionHeading: { ...styles.sectionHeading, fontSize: s(7.5) },
    itemTitle: { ...styles.itemTitle, fontSize: s(9) },
    itemSubtitle: { ...styles.itemSubtitle, fontSize: s(8.5) },
    itemDate: { ...styles.itemDate, fontSize: s(7.5) },
    itemDesc: { ...styles.itemDesc, fontSize: s(8) },
    bulletDot: { ...styles.bulletDot, fontSize: s(7.5) },
    bulletText: { ...styles.bulletText, fontSize: s(8) },
    summary: { ...styles.summary, fontSize: s(8.5) },
    tag: { ...styles.tag, fontSize: s(8) },
    tagSeparator: { ...styles.tagSeparator, fontSize: s(8) },
    contactItem: { ...styles.contactItem, fontSize: s(7.5) },
    footerText: { ...styles.footerText, fontSize: s(6.5) },
  } as typeof styles;

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

  // Build contact items from props
  const propContact: string[] = [];
  if (email) propContact.push(email);
  if (phone) propContact.push(phone);
  if (linkedinUrl) propContact.push(linkedinUrl);
  if (location) propContact.push(location);

  // Sparse adjustments — Swiss design means generous whitespace
  const isSparse = sc > 1.2;
  const sectionMarginBottom = isSparse ? s(20) : s(12);
  const itemMarginBottom = isSparse ? s(12) : s(6);
  const headerPaddingTop = isSparse ? s(36) : s(28);
  const bodyPaddingBottom = isSparse ? s(36) : s(28);
  const photoSize = isSparse ? s(92) : s(76);

  return (
    <Document>
      <Page size="A4" style={t.page}>
        {/* ── Header ── */}
        <View style={[t.header, { paddingTop: headerPaddingTop }]}>
          <View style={t.headerTop}>
            <Text style={t.name}>{displayName}</Text>
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
          {displayHeadline ? (
            <Text style={t.headline}>{displayHeadline}</Text>
          ) : null}
          <View style={t.thinSeparator} />
        </View>

        {/* ── Body ── */}
        <View style={[t.body, { paddingBottom: bodyPaddingBottom }]}>
          {/* ── Contact ── */}
          {(propContact.length > 0 || hasItems(contactSection)) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text style={t.sectionHeading}>Contact</Text>
              <View style={t.contactRow}>
                {propContact.map((item, i) => (
                  <Text key={i} style={t.contactItem}>{item}</Text>
                ))}
                {hasItems(contactSection) && propContact.length === 0
                  ? contactSection.items
                      .filter((item) => {
                        const text = typeof item === "string" ? item : item.title || "";
                        // If we have the real LinkedIn URL from props, suppress AI-hallucinated ones
                        if (linkedinUrl && /linkedin\.com/i.test(text)) return false;
                        return true;
                      })
                      .map((item, i) => (
                        <Text key={`c${i}`} style={t.contactItem}>
                          {typeof item === "string" ? item : item.title || ""}
                        </Text>
                      ))
                  : null}
              </View>
            </View>
          )}

          {/* ── Summary ── */}
          {hasItems(summarySection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text style={t.sectionHeading}>
                {summarySection.heading || "Summary"}
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
              <Text style={t.sectionHeading}>
                {experienceSection.heading || "Experience"}
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
                  <View
                    key={i}
                    style={[t.item, { marginBottom: itemMarginBottom }]}
                  >
                    <Text style={t.itemTitle}>{item.title || ""}</Text>
                    {item.subtitle ? (
                      <Text style={t.itemSubtitle}>{item.subtitle}</Text>
                    ) : null}
                    {item.date ? (
                      <Text style={t.itemDate}>{item.date}</Text>
                    ) : null}
                    {bullets.map((b, bi) => (
                      <View key={bi} style={t.bullet}>
                        <Text style={t.bulletDot}>—</Text>
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
              <Text style={t.sectionHeading}>
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
                  <View
                    key={i}
                    style={[t.item, { marginBottom: itemMarginBottom }]}
                  >
                    <Text style={t.itemTitle}>{item.title || ""}</Text>
                    {item.subtitle ? (
                      <Text style={t.itemSubtitle}>{item.subtitle}</Text>
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
              <Text style={t.sectionHeading}>
                {skillsSection.heading || "Skills"}
              </Text>
              <View style={t.tagList}>
                {skillsSection.items.map((item, i) => (
                  <View key={i} style={{ flexDirection: "row" }}>
                    <Text style={t.tag}>
                      {typeof item === "string" ? item : item.title || ""}
                    </Text>
                    {i < skillsSection.items.length - 1 && (
                      <Text style={t.tagSeparator}>·</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Certifications ── */}
          {hasItems(certSection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text style={t.sectionHeading}>
                {certSection.heading || "Certifications"}
              </Text>
              {certSection.items.map((item, i) => {
                if (typeof item === "string") {
                  return (
                    <View key={i} style={t.bullet}>
                      <Text style={t.bulletDot}>—</Text>
                      <Text style={t.bulletText}>{item}</Text>
                    </View>
                  );
                }
                return (
                  <View
                    key={i}
                    style={[t.item, { marginBottom: itemMarginBottom }]}
                  >
                    <Text style={t.itemTitle}>{item.title || ""}</Text>
                    {item.subtitle ? (
                      <Text style={t.itemSubtitle}>{item.subtitle}</Text>
                    ) : null}
                    {item.date ? (
                      <Text style={t.itemDate}>{item.date}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Languages ── */}
          {hasItems(langSection) && (
            <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
              <Text style={t.sectionHeading}>
                {langSection.heading || "Languages"}
              </Text>
              <View style={t.tagList}>
                {langSection.items.map((item, i) => (
                  <View key={i} style={{ flexDirection: "row" }}>
                    <Text style={t.tag}>
                      {typeof item === "string" ? item : item.title || ""}
                    </Text>
                    {i < langSection.items.length - 1 && (
                      <Text style={t.tagSeparator}>·</Text>
                    )}
                  </View>
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
