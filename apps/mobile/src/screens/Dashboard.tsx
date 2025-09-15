import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "../theme/colors";
import { FeatureGate } from "../components/FeatureGate";

// Toggle map for gated features (based on keys you’ve added so far):
// Set these booleans from runtime/config (future), hard-coded for now.
const featureEnabled = {
  // Live modules (no extra keys required)
  core: true,
  inventory: true,
  manufacturing: true,
  projects: true,
  analytics: true,

  // Gated (keys needed)
  stripe: false,
  truelayer: false,
  hmrc: false,
  hubspot: false,
  marketplaces: false,
  notifications: false,
};

export default function Dashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Nexa ERP</Text>
      <Text style={styles.subheading}>Welcome back</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live</Text>
        <FeatureGate enabled={featureEnabled.core} title="Core Platform" subtitle="Users, Tenants, RBAC/SoD, Audit" />
        <FeatureGate enabled={featureEnabled.inventory} title="Inventory & WMS" subtitle="Items, Warehouses, Movements" />
        <FeatureGate enabled={featureEnabled.manufacturing} title="Manufacturing" subtitle="BOM, Work Orders, MRP/APS" />
        <FeatureGate enabled={featureEnabled.projects} title="Projects" subtitle="Tasks, Time/Cost, Billing" />
        <FeatureGate enabled={featureEnabled.analytics} title="Analytics & Dashboards" subtitle="KPIs, Trends, Insights" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connect to enable</Text>
        <FeatureGate enabled={featureEnabled.stripe} title="Stripe" subtitle="Billing & POS" pill="🔒 Connect to enable" />
        <FeatureGate enabled={featureEnabled.truelayer} title="Open Banking (TrueLayer)" subtitle="Bank feeds & payments" pill="🔒 Connect to enable" />
        <FeatureGate enabled={featureEnabled.hmrc} title="HMRC VAT (MTD)" subtitle="VAT submissions" pill="🔒 Connect to enable" />
        <FeatureGate enabled={featureEnabled.hubspot} title="HubSpot CRM" subtitle="Leads & Contacts" pill="🔒 Connect to enable" />
        <FeatureGate enabled={featureEnabled.marketplaces} title="Marketplaces" subtitle="Amazon, eBay, Shopify" pill="🔒 Connect to enable" />
        <FeatureGate enabled={featureEnabled.notifications} title="Notifications" subtitle="SMS/Email (Twilio)" pill="🔒 Connect to enable" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  heading: { color: colors.text, fontSize: 28, fontWeight: "800" },
  subheading: { color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  section: { marginTop: 12, marginBottom: 6 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
});
