import { defineField, defineType } from "sanity";

const contentSnapshotFields = () => [
  defineField({
    name: "name",
    title: "Name",
    type: "string",
    readOnly: true,
  }),
  defineField({
    name: "link",
    title: "Link",
    type: "url",
    readOnly: true,
  }),
  defineField({
    name: "description",
    title: "Description",
    type: "text",
    rows: 3,
    readOnly: true,
  }),
  defineField({
    name: "introduction",
    title: "Introduction",
    type: "text",
    rows: 12,
    readOnly: true,
  }),
  defineField({
    name: "categories",
    title: "Categories",
    type: "array",
    of: [{ type: "string" }],
    readOnly: true,
  }),
  defineField({
    name: "tags",
    title: "Tags",
    type: "array",
    of: [{ type: "string" }],
    readOnly: true,
  }),
  defineField({
    name: "imageUrl",
    title: "Image URL",
    type: "url",
    readOnly: true,
  }),
  defineField({
    name: "iconUrl",
    title: "Icon URL",
    type: "url",
    readOnly: true,
  }),
];

const contentSnapshot = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    readOnly: true,
    fields: contentSnapshotFields(),
  });

export default defineType({
  name: "itemUpdateProposal",
  title: "Item Update Proposal",
  type: "document",
  groups: [
    { name: "review", title: "Review" },
    { name: "source", title: "Source" },
    { name: "content", title: "Content" },
  ],
  fields: [
    defineField({
      name: "item",
      title: "Item",
      type: "reference",
      to: [{ type: "item" }],
      group: "review",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "review",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Accepted", value: "accepted" },
          { title: "Rejected", value: "rejected" },
          { title: "Stale", value: "stale" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sourceName",
      title: "Discovery Source",
      type: "string",
      group: "source",
      readOnly: true,
    }),
    defineField({
      name: "sourceUrl",
      title: "Discovery URL",
      type: "url",
      group: "source",
      readOnly: true,
    }),
    defineField({
      name: "officialUrl",
      title: "Official URL",
      type: "url",
      group: "source",
      readOnly: true,
    }),
    defineField({
      name: "sourceHash",
      title: "Source Snapshot Hash",
      type: "string",
      group: "source",
      readOnly: true,
    }),
    defineField({
      name: "capturedAt",
      title: "Captured At",
      type: "datetime",
      group: "source",
      readOnly: true,
    }),
    defineField({
      name: "baseItemUpdatedAt",
      title: "Base Item Updated At",
      type: "datetime",
      group: "review",
      readOnly: true,
    }),
    defineField({
      name: "baseContentHash",
      title: "Base Content Hash",
      type: "string",
      group: "review",
      readOnly: true,
    }),
    contentSnapshot("currentContent", "Current Content"),
    contentSnapshot("proposedContent", "Proposed Content"),
    defineField({
      name: "changedFields",
      title: "Changed Fields",
      type: "array",
      of: [{ type: "string" }],
      group: "review",
      readOnly: true,
    }),
    defineField({
      name: "diffSummary",
      title: "Diff Summary",
      type: "array",
      of: [{ type: "string" }],
      group: "review",
      readOnly: true,
    }),
    defineField({
      name: "reviewNote",
      title: "Review Note",
      type: "text",
      rows: 4,
      group: "review",
      readOnly: true,
    }),
    defineField({
      name: "reviewedAt",
      title: "Reviewed At",
      type: "datetime",
      group: "review",
      readOnly: true,
    }),
    defineField({
      name: "reviewedBy",
      title: "Reviewed By",
      type: "string",
      group: "review",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      itemName: "item.name",
      status: "status",
      changedFields: "changedFields",
      capturedAt: "capturedAt",
    },
    prepare({ itemName, status, changedFields, capturedAt }) {
      const fieldCount = Array.isArray(changedFields)
        ? changedFields.length
        : 0;
      const date = capturedAt
        ? new Date(capturedAt).toLocaleDateString("en-CA")
        : "unknown date";
      return {
        title: `${status?.toUpperCase() ?? "UNKNOWN"}: ${itemName ?? "Item"}`,
        subtitle: `${fieldCount} changed field(s), captured ${date}`,
      };
    },
  },
  orderings: [
    {
      title: "Captured At (Newest)",
      name: "capturedAtDesc",
      by: [{ field: "capturedAt", direction: "desc" }],
    },
  ],
});
