export interface YouTubeTrack {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
  };
}

export interface chat {
  name: string,
  message: string
}