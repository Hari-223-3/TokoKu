import Icon from "./Icon";

export default function EmptyState({ message, icon = "inbox", children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory-alt text-muted">
        <Icon name={icon} size={22} />
      </span>
      <p className="text-sm font-semibold text-muted">{message}</p>
      {children}
    </div>
  );
}
