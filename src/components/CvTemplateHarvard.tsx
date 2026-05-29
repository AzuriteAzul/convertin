import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import type { CvJson } from "@/types";
import { parseBullets, hasItems } from "@/lib/cv-helpers";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 9,
    lineHeight: 1.55,
    color: "#000000",
    padding: "36pt 40pt 36pt 40pt",
  },
  /* ── Header ── */
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  photoWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    objectFit: "cover",
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 3.5,
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 1.2,
  },
  headline: {
    fontSize: 9,
    fontStyle: "italic",
    textAlign: "center",
    color: "#333333",
    marginBottom: 6,
    lineHeight: 1.35,
  },
  contactLine: {
    fontSize: 7.5,
    textAlign: "center",
    color: "#444444",
    letterSpacing: 0.3,
    lineHeight: 1.4,
  },
  /* ── Section ── */
  section: {
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    textAlign: "center",
    borderTop: "1pt solid #000000",
    borderBottom: "1pt solid #000000",
    paddingVertical: 3,
    marginBottom: 6,
    marginTop: 2,
    lineHeight: 1.3,
  },
  /* ── Items ── */
  item: {
    marginBottom: 6,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 1,
  },
  itemTitle: {
    fontSize: 9,
    fontWeight: 700,
    flex: 1,
    lineHeight: 1.35,
  },
  itemDate: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#333333",
    textAlign: "right",
    minWidth: 90,
    lineHeight: 1.35,
  },
  itemSubtitle: {
    fontSize: 8.5,
    fontStyle: "italic",
    marginBottom: 2,
    lineHeight: 1.3,
    color: "#222222",
  },
  itemDesc: {
    fontSize: 8.5,
    lineHeight: 1.45,
    textAlign: "justify",
    color: "#222222",
  },
  summary: {
    fontSize: 8.5,
    lineHeight: 1.5,
    textAlign: "justify",
    color: "#222222",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 12,
  },
  listBullet: {
    width: 10,
    fontSize: 8,
    lineHeight: 1.45,
    color: "#555555",
  },
  listText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.45,
    textAlign: "justify",
    color: "#222222",
  },
  /* ── Skills / Tags ── */
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    fontSize: 8.5,
    fontStyle: "italic",
    color: "#333333",
    lineHeight: 1.4,
  },
  tagSeparator: {
    fontSize: 8.5,
    color: "#999999",
    lineHeight: 1.4,
  },
  /* ── Footer ── */
  footer: {
    position: "absolute",
    bottom: 8,
    right: 40,
    left: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 6.5,
    color: "#888888",
    fontStyle: "italic",
    textAlign: "center",
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

export function CvTemplateHarvard({
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

  // Harvard uses Times-Roman (wider than Inter) and larger base font (9 vs 8),
  // so apply an extra compression factor to guarantee single-page output.
  // At 1.0x we stay at 100%; at 0.82x (max density) we go to ~88% of the
  // already-reduced scale to prevent overflow.
  const harvardCompression = 1 - (1 - sc) * 0.45;
  const h = (b: number) => s(b * harvardCompression);

  const t = {
    ...styles,
    page: { ...styles.page, fontSize: h(9) },
    name: { ...styles.name, fontSize: h(20) },
    headline: { ...styles.headline, fontSize: h(9) },
    contactLine: { ...styles.contactLine, fontSize: h(7.5) },
    sectionHeading: { ...styles.sectionHeading, fontSize: h(9) },
    itemTitle: { ...styles.itemTitle, fontSize: h(9) },
    itemDate: { ...styles.itemDate, fontSize: h(8) },
    itemSubtitle: { ...styles.itemSubtitle, fontSize: h(8.5) },
    itemDesc: { ...styles.itemDesc, fontSize: h(8.5) },
    listText: { ...styles.listText, fontSize: h(8.5) },
    listBullet: { ...styles.listBullet, fontSize: h(8) },
    summary: { ...styles.summary, fontSize: h(8.5) },
    tag: { ...styles.tag, fontSize: h(8.5) },
    tagSeparator: { ...styles.tagSeparator, fontSize: h(8.5) },
    footerText: { ...styles.footerText, fontSize: s(6.5) },
  } as typeof styles;

  // Academic order: Education first, then Experience
  const summarySection = sections.find((s) => s.type === "summary");
  const educationSection = sections.find((s) => s.type === "education");
  const experienceSection = sections.find((s) => s.type === "experience");
  const skillsSection = sections.find((s) => s.type === "skills");
  const certSection = sections.find((s) => s.type === "certifications");
  const langSection = sections.find((s) => s.type === "languages");
  const contactSection = sections.find((s) => s.type === "contact");
  const linkedinNoteSection = sections.find((s) => s.type === "linkedinNote");

  const displayName = fullName || "Your Name";
  const displayHeadline = headline || "";

  // Build contact line from props + contact section items
  const propContact: string[] = [];
  if (email) propContact.push(email);
  if (phone) propContact.push(phone);
  if (linkedinUrl) propContact.push(linkedinUrl);
  if (location) propContact.push(location);
  const sectionContact: string[] = contactSection
    ? contactSection.items
        .filter((item) => {
          // If we have the real LinkedIn URL, suppress AI-hallucinated links
          if (linkedinUrl) {
            const t = typeof item === "string" ? item : item.title || "";
            if (/linkedin\.com/i.test(t)) return false;
          }
          return true;
        })
        .map((item) => typeof item === "string" ? item : item.title || "")
    : [];
  const contactItems = [...propContact, ...sectionContact];

  // Sparse adjustments
  const isSparse = sc > 1.2;
  const sectionMarginBottom = isSparse ? s(16) : s(10);
  const itemMarginBottom = isSparse ? s(10) : s(6);
  const pagePaddingTop = isSparse ? s(44) : s(36);
  const pagePaddingBottom = isSparse ? s(44) : s(36);
  const photoSize = isSparse ? s(88) : s(72);

  return (
    <Document>
      <Page
        size="A4"
        wrap={false}
        style={[
          t.page,
          {
            paddingTop: pagePaddingTop,
            paddingBottom: pagePaddingBottom,
          },
        ]}
      >
        {/* ── Header ── */}
        <View style={[t.header, { marginBottom: isSparse ? s(20) : s(16) }]}>
          {photoUrl ? (
            <View style={t.photoWrap}>
              <Image
                src={photoUrl}
                style={[
                  t.photo,
                  {
                    width: photoSize,
                    height: photoSize,
                    borderRadius: photoSize / 2,
                  },
                ]}
              />
            </View>
          ) : null}
          <Text style={t.name}>{displayName}</Text>
          {displayHeadline ? (
            <Text style={t.headline}>{displayHeadline}</Text>
          ) : null}
          {contactItems.length > 0 ? (
            <Text style={t.contactLine}>{contactItems.join("  |  ")}</Text>
          ) : null}
        </View>

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

        {/* ── Education (academic order: first) ── */}
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
                  <View style={t.itemTitleRow}>
                    <Text style={t.itemTitle}>{item.title || ""}</Text>
                    {item.date ? (
                      <Text style={t.itemDate}>{item.date}</Text>
                    ) : null}
                  </View>
                  {item.subtitle ? (
                    <Text style={t.itemSubtitle}>{item.subtitle}</Text>
                  ) : null}
                  {item.description ? (
                    <Text style={t.itemDesc}>{item.description}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* ── Experience ── */}
        {hasItems(experienceSection) && (
          <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
            <Text style={t.sectionHeading}>
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
                <View
                  key={i}
                  style={[t.item, { marginBottom: itemMarginBottom }]}
                >
                  <View style={t.itemTitleRow}>
                    <Text style={t.itemTitle}>{item.title || ""}</Text>
                    {item.date ? (
                      <Text style={t.itemDate}>{item.date}</Text>
                    ) : null}
                  </View>
                  {item.subtitle ? (
                    <Text style={t.itemSubtitle}>{item.subtitle}</Text>
                  ) : null}
                  {bullets.map((b, bi) => (
                    <View key={bi} style={t.listItem}>
                      <Text style={t.listBullet}>—</Text>
                      <Text style={t.listText}>{b}</Text>
                    </View>
                  ))}
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
            <View style={t.tagRow}>
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
                  <View key={i} style={t.listItem}>
                    <Text style={t.listBullet}>—</Text>
                    <Text style={t.listText}>{item}</Text>
                  </View>
                );
              }
              return (
                <View
                  key={i}
                  style={[t.item, { marginBottom: itemMarginBottom }]}
                >
                  <View style={t.itemTitleRow}>
                    <Text style={t.itemTitle}>{item.title || ""}</Text>
                    {item.date ? (
                      <Text style={t.itemDate}>{item.date}</Text>
                    ) : null}
                  </View>
                  {item.subtitle ? (
                    <Text style={t.itemSubtitle}>{item.subtitle}</Text>
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
            <View style={t.tagRow}>
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

        {/* ── Contact ── */}
        {hasItems(contactSection) && (
          <View style={[t.section, { marginBottom: sectionMarginBottom }]}>
            <Text style={t.sectionHeading}>
              {contactSection.heading || "Contact"}
            </Text>
            {contactSection.items.map((item, i) => (
              <Text key={i} style={t.summary}>
                {typeof item === "string"
                  ? item
                  : item.title || item.subtitle || ""}
              </Text>
            ))}
          </View>
        )}

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
