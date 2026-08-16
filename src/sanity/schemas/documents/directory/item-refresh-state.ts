import { defineField, defineType } from "sanity";

export default defineType({
  name: "itemRefreshState",
  title: "Item Refresh State",
  type: "document",
  fields: [
    defineField({
      name: "item",
      title: "Item",
      type: "reference",
      to: [{ type: "item" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lastSourceHash",
      title: "Last Source Hash",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "lastCheckedAt",
      title: "Last Checked At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "lastProposal",
      title: "Last Proposal",
      type: "reference",
      to: [{ type: "itemUpdateProposal" }],
      readOnly: true,
    }),
    defineField({
      name: "lastError",
      title: "Last Error",
      type: "text",
      rows: 3,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      itemName: "item.name",
      lastCheckedAt: "lastCheckedAt",
      lastError: "lastError",
    },
    prepare({ itemName, lastCheckedAt, lastError }) {
      return {
        title: itemName ?? "Item Refresh State",
        subtitle: lastError
          ? `Error: ${lastError}`
          : `Checked ${lastCheckedAt ?? "never"}`,
      };
    },
  },
});
