# SeMSe
Se[mantic]M[edia]Se[arch] aims to more easily find episodes based on either the descriptions or conversations in the media given a media library.
The idea behind it is that SeMSe will scan your media library 
1. for nfo files that contain descriptions of the episodes
2. for embedded subtitles in the video files (using the subtitle stream) given specific languages
3. for external subtitles in the same folder as the video files given specific languages

To retrieve the descriptions within nfo files, SeMSe uses the ``<plot>`` tag. For the subtitles,
SeMSe looks for embedded subtitles in one of these formats: ``subrip``, ``ass``, ``hdmv_pgs_subtitle`` as well
as matching languages. By default, the language is set to ``en`` but it can be modified in the configuration file. 
Additionally, SeMSe can also look for external subtitles in the same folder as the video files. These must have their
respectively language code in the filename, e.g. ``movie.en.srt``.

Then, SeMSe will try to retrieve individual conversations from the subtitles. Once this is done for all episodes,
every conversation will be encoded into a vector using a pre-trained model (SentenceTransformer). Afterwards,
every conversation as well as every description will be added to the database where they can be searched for using 
natural language queries.
