"use client";

import { useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  useTracks,
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Loader2, Mic, MicOff, PhoneOff, Users, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/chat/user-avatar";
import { useCallStore } from "@/stores/call.store";
import { useCall } from "@/hooks/use-call";
import { cn } from "@/lib/utils";

function VideoStage() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} className="h-full">
      <ParticipantTile />
    </GridLayout>
  );
}

function AudioStage() {
  const { peer, isGroup, groupName } = useCallStore();
  const remotes = useRemoteParticipants();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
      {isGroup ? (
        <div className="flex size-28 items-center justify-center rounded-full bg-white/10">
          <Users className="size-12" />
        </div>
      ) : (
        <UserAvatar name={peer?.name} src={peer?.avatarUrl} className="size-28" />
      )}
      <p className="text-xl font-semibold">{isGroup ? (groupName ?? "Group call") : peer?.name}</p>
      <p className="text-sm text-white/60">
        {remotes.length === 0 ? "Ringing…" : `${remotes.length + 1} on the call`}
      </p>
    </div>
  );
}

function CallControls() {
  const callType = useCallStore((s) => s.callType);
  const { end } = useCall();
  const { localParticipant } = useLocalParticipant();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(callType === "VIDEO");

  const toggleMic = async () => {
    await localParticipant.setMicrophoneEnabled(!micOn);
    setMicOn((v) => !v);
  };
  const toggleCam = async () => {
    await localParticipant.setCameraEnabled(!camOn);
    setCamOn((v) => !v);
  };

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Button
        variant="secondary"
        size="icon-lg"
        className="rounded-full"
        onClick={toggleMic}
        aria-label={micOn ? "Mute" : "Unmute"}
      >
        {micOn ? <Mic /> : <MicOff />}
      </Button>
      <Button
        variant="secondary"
        size="icon-lg"
        className="rounded-full"
        onClick={toggleCam}
        aria-label={camOn ? "Turn camera off" : "Turn camera on"}
      >
        {camOn ? <Video /> : <VideoOff />}
      </Button>
      <Button
        variant="destructive"
        size="icon-lg"
        className="rounded-full bg-red-600 text-white hover:bg-red-700"
        onClick={end}
        aria-label="Leave call"
      >
        <PhoneOff />
      </Button>
    </div>
  );
}

export function CallWindow() {
  const { status, token, url, callType, peer, isGroup, groupName } = useCallStore();
  const { end } = useCall();

  const active = status === "outgoing" || status === "connecting" || status === "active";
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-950">
      {/* Pre-connect state (waiting for token). */}
      {!token || !url ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-white">
          {isGroup ? (
            <div className="flex size-24 items-center justify-center rounded-full bg-white/10">
              <Users className="size-10" />
            </div>
          ) : (
            <UserAvatar name={peer?.name} src={peer?.avatarUrl} className="size-24" />
          )}
          <p className="text-lg font-semibold">
            {isGroup ? (groupName ?? "Group call") : peer?.name}
          </p>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="size-4 animate-spin" /> Calling…
          </div>
          <Button
            variant="destructive"
            size="icon-lg"
            className="mt-4 rounded-full bg-red-600 text-white hover:bg-red-700"
            onClick={end}
            aria-label="Cancel"
          >
            <PhoneOff />
          </Button>
        </div>
      ) : (
        <LiveKitRoom
          serverUrl={url}
          token={token}
          connect
          audio
          video={callType === "VIDEO"}
          onDisconnected={end}
          data-lk-theme="default"
          className={cn("flex flex-1 flex-col")}
        >
          <div className="min-h-0 flex-1">
            {callType === "VIDEO" ? <VideoStage /> : <AudioStage />}
          </div>
          <RoomAudioRenderer />
          <CallControls />
        </LiveKitRoom>
      )}
    </div>
  );
}
