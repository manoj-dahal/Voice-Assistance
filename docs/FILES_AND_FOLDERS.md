# Files and Folders

## Dashboard drop zone

Files and folders can be dragged anywhere onto the Dashboard.

ERA displays:

- file or folder icon;
- name;
- type;
- size;
- folder file count;
- bounded path samples;
- local image thumbnail when safe to preview.

## No attachment-size rejection

ERA does not reject an attachment solely because of file or folder size. Large items remain metadata-only instead of being loaded into browser memory.

Processing remains bounded:

- text extraction is limited;
- provider context is limited;
- large image preview decoding is avoided;
- folder path samples are limited;
- binary data is not uploaded automatically.

## Folder manifests

On browsers that expose directory-entry APIs, ERA recursively counts files and combined size. It records a bounded local path sample and does not upload the folder automatically.

## Provider context

- Text, code, and data excerpts may be included after privacy checks.
- Binary attachments send metadata only.
- Images require the dedicated vision approval flow before provider transmission.
- Attachments are never executed.

## Session lifecycle

Local object URLs used for image previews are revoked when attachments are removed or conversation history is cleared.
