export type StatusTone = "online" | "attention" | "offline" | "neutral";

export type Integration = {
  name: string;
  shortName: string;
  description: string;
  status: string;
  detail: string;
  tone: StatusTone;
};

export type Conversation = {
  id: string;
  customer: string;
  initials: string;
  channel: "WhatsApp" | "Instagram";
  lastMessage: string;
  stage: string;
  temperature: "Fria" | "Morna" | "Quente";
  time: string;
};

export type ChecklistItem = {
  label: string;
  detail: string;
  state: "done" | "active" | "pending";
};
