import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { GeneratedResume } from "@/lib/ai/generateTailoredResume";

// ── Styles ─────────────────────────────────────────────────────────────────
const COLORS = {
  text: "#000000",
  muted: "#333333",
  lightMuted: "#555555",
  line: "#000000",
  link: "#000000",
};

const FONT_SIZES = {
  name: 18,
  contact: 9,
  sectionHeading: 11,
  body: 9.5,
  small: 9,
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 40,
    paddingRight: 40,
    lineHeight: 1.25,
  },

  // ── Header (Centered) ──
  headerBlock: {
    marginBottom: 4,
    alignItems: "center",
  },
  name: {
    fontSize: FONT_SIZES.name,
    fontFamily: "Helvetica-Bold",
    color: COLORS.text,
    marginBottom: 2,
    marginTop: 0,
    lineHeight: 1.1,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 3,
    marginTop: 1,
    fontSize: FONT_SIZES.contact,
    color: COLORS.muted,
  },
  contactSep: {
    color: COLORS.lightMuted,
    marginHorizontal: 3,
  },
  contactLink: {
    color: COLORS.link,
    textDecoration: "none",
  },

  // ── Section Headers ──
  section: {
    marginTop: 6,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    borderBottomStyle: "solid",
    marginBottom: 3,
    paddingBottom: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sectionHeading,
    fontFamily: "Helvetica-Bold",
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Summary ──
  summaryText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 1.25,
    textAlign: "justify",
  },

  // ── Skills ──
  skillsGrid: {
    flexDirection: "column",
    gap: 1.5,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  skillCategory: {
    fontSize: FONT_SIZES.body,
    fontFamily: "Helvetica-Bold",
    color: COLORS.text,
    width: 110,
    flexShrink: 0,
  },
  skillItems: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 1.2,
  },

  // ── Projects ──
  projectBlock: {
    marginBottom: 4,
  },
  projectTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 1,
  },
  projectName: {
    fontFamily: "Helvetica-Bold",
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },
  projectTechStack: {
    fontSize: FONT_SIZES.small,
    color: COLORS.lightMuted,
    fontFamily: "Helvetica-Oblique",
  },
  projectDesc: {
    fontSize: FONT_SIZES.body,
    color: COLORS.muted,
    marginBottom: 1.5,
    fontFamily: "Helvetica-Oblique",
  },

  // ── Bullets ──
  bulletBlock: {
    flexDirection: "row",
    marginBottom: 0.5,
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 8,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 1.25,
    textAlign: "justify",
  },

  // ── Experience / Education / Cert ──
  entryBlock: {
    marginBottom: 3,
  },
  entryText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    lineHeight: 1.25,
  },
  certText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    marginBottom: 0.5,
  },
  certLink: {
    fontSize: FONT_SIZES.small,
    color: COLORS.lightMuted,
    textDecoration: "underline",
    fontFamily: "Helvetica-Oblique",
  },
});

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletBlock}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

// ── Main Document ───────────────────────────────────────────────────────────

export function ResumeDocument({ data }: { data: GeneratedResume }) {
  const {
    name,
    contact,
    summary,
    skills,
    projects,
    experience,
    education,
    certifications,
  } = data;

  // Build contact line segments (filter nulls)
  const contactParts: { label: string; href?: string }[] = [];
  if (contact.location) contactParts.push({ label: contact.location });
  if (contact.phone) contactParts.push({ label: contact.phone });
  if (contact.email)
    contactParts.push({
      label: contact.email,
      href: `mailto:${contact.email}`,
    });
  if (contact.linkedin)
    contactParts.push({ label: "LinkedIn", href: contact.linkedin });
  if (contact.github)
    contactParts.push({ label: "GitHub", href: contact.github });
  if (contact.portfolio)
    contactParts.push({ label: "Portfolio", href: contact.portfolio });

  const hasExperience =
    experience.length > 0 && experience.some((e) => e.trim());
  const hasCerts = certifications.length > 0;

  return (
    <Document
      title={`${name} – Resume`}
      author={name}
      subject="Software Engineering Resume"
    >
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.headerBlock}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.contactRow}>
            {contactParts.map((part, i) => (
              <View
                key={i}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                {i > 0 && <Text style={styles.contactSep}> | </Text>}
                {part.href ? (
                  <Link src={part.href} style={styles.contactLink}>
                    {part.label}
                  </Link>
                ) : (
                  <Text>{part.label}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── SUMMARY ── */}
        {summary ? (
          <View style={styles.section}>
            <SectionHeading title="Professional Summary" />
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        {/* ── SKILLS ── */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Technical Skills" />
            <View style={styles.skillsGrid}>
              {skills.map((group, i) => (
                <View key={i} style={styles.skillRow}>
                  <Text style={styles.skillCategory}>{group.category}:</Text>
                  <Text style={styles.skillItems}>
                    {group.items.join(", ")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── EXPERIENCE ── */}
        {hasExperience && (
          <View style={styles.section}>
            <SectionHeading title="Professional Experience" />
            {experience.map((entry, i) => (
              <View key={i} style={styles.entryBlock}>
                {/* The AI returns raw strings for experience. We render them directly.
                    Ideally they are formatted well by the prompt. */}
                <Text style={styles.entryText}>{entry}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── PROJECTS ── */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Projects" />
            {projects.map((proj, i) => (
              <View key={i} style={styles.projectBlock}>
                <View style={styles.projectTitleRow}>
                  <Text style={styles.projectName}>{proj.name}</Text>
                  <Text style={styles.projectTechStack}>
                    {proj.techStack.join(", ")}
                  </Text>
                </View>
                {proj.description ? (
                  <Text style={styles.projectDesc}>{proj.description}</Text>
                ) : null}
                {proj.bullets.map((b, j) => (
                  <BulletPoint key={j} text={b} />
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── EDUCATION ── */}
        {education.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="Education" />
            {education.map((entry, i) => (
              <View key={i} style={styles.entryBlock}>
                <Text style={styles.entryText}>{entry}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── CERTIFICATIONS ── */}
        {hasCerts && (
          <View style={styles.section}>
            <SectionHeading title="Certifications" />
            {certifications.map((cert, i) => (
              <View key={i} style={styles.entryBlock}>
                <Text style={styles.certText}>
                  {cert.name}
                  {cert.issuer ? ` – ${cert.issuer}` : ""}
                  {cert.date ? ` (${cert.date})` : ""}
                </Text>
                {cert.link ? (
                  <Link src={cert.link} style={styles.certLink}>
                    View Certificate
                  </Link>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
