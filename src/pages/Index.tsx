import { useState, useCallback, useEffect } from "react";
import LEDGrid, { getPattern, PATTERN_NAMES } from "@/components/LEDGrid";
import { useSerial } from "@/hooks/useSerial";
import { updateMicrobitState } from "@/lib/firebase";

const Index = () => {
  const [currentPattern, setCurrentPattern] = useState("clear");
  const [firebaseStatus, setFirebaseStatus] = useState<"idle" | "syncing" | "synced">("idle");

  const handleData = useCallback((data: string) => {
    const lower = data.toLowerCase().trim();
    if (lower === "on") {
      setCurrentPattern("heart");
      syncToFirebase("heart");
    } else {
      setCurrentPattern("clear");
      syncToFirebase("clear");
    }
  }, []);

  const { isConnected, connect, disconnect, lastMessage, log } = useSerial(handleData);

  const syncToFirebase = async (state: string) => {
    setFirebaseStatus("syncing");
    try {
      await updateMicrobitState(state);
      setFirebaseStatus("synced");
      setTimeout(() => setFirebaseStatus("idle"), 1500);
    } catch {
      setFirebaseStatus("idle");
    }
  };

  const pattern = getPattern(currentPattern);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm" style={{ fontFamily: "var(--font-mono)" }}>μ</span>
            </div>
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              micro:bit Monitor
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <FirebaseIndicator status={firebaseStatus} />
            <ConnectionButton
              isConnected={isConnected}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* LED Display */}
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
              LED Display
            </h2>
            <LEDGrid pattern={pattern} />
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
              Pattern: <span className="text-primary font-medium">{currentPattern}</span>
            </p>

            {/* Manual pattern buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              {PATTERN_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setCurrentPattern(name);
                    syncToFirebase(name);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    currentPattern === name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Serial Log */}
          <div className="flex flex-col gap-4">
            <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
              Serial Monitor
            </h2>
            <div className="rounded-xl bg-card border border-border p-4 h-[400px] overflow-y-auto">
              {log.length === 0 ? (
                <p className="text-muted-foreground text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                  {isConnected ? "Waiting for data..." : "Connect your micro:bit to start"}
                </p>
              ) : (
                <div className="space-y-1">
                  {log.map((entry, i) => (
                    <p
                      key={i}
                      className="text-xs text-muted-foreground leading-relaxed"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {entry}
                    </p>
                  ))}
                </div>
              )}
            </div>
            {lastMessage && (
              <div className="rounded-lg bg-secondary border border-border px-4 py-3">
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                  Last message
                </p>
                <p className="text-sm text-foreground font-medium mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                  {lastMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const ConnectionButton = ({
  isConnected,
  onConnect,
  onDisconnect,
}: {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) => (
  <button
    onClick={isConnected ? onDisconnect : onConnect}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isConnected
        ? "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
        : "bg-primary text-primary-foreground hover:opacity-90 animate-pulse-glow"
    }`}
    style={{ fontFamily: "var(--font-mono)" }}
  >
    {isConnected ? "Disconnect" : "Connect micro:bit"}
  </button>
);

const FirebaseIndicator = ({ status }: { status: "idle" | "syncing" | "synced" }) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
    <div
      className={`w-2 h-2 rounded-full transition-colors ${
        status === "synced"
          ? "bg-green-500"
          : status === "syncing"
          ? "bg-yellow-500 animate-pulse"
          : "bg-muted-foreground/30"
      }`}
    />
    Firebase {status === "synced" ? "synced" : status === "syncing" ? "syncing..." : "ready"}
  </div>
);

export default Index;
