# Logo Assets

These SVG files are local image assets used by the demo header and target
selector. The UI reads logo metadata from `configs/groups.json` through the
`logoAsset` field, so logo identity is part of the reproducible group template
rather than hard-coded React logic.

Current files replace the earlier hand-drawn stand-ins with public source logo
assets matching the user-provided visual references:

- `samsung.svg`: Wikimedia Commons `Samsung Logo (RGB).svg`
- `sk.svg`: Wikimedia Commons `SK logo.svg`
- `hyundai.svg`: Wikimedia Commons `Hyundai Motor Company logo.svg`
- `lg.svg`: Wikimedia Commons `LG logo (2014).svg`
- `hanwha.svg`: Wikimedia Commons `Hanwha logo.svg` archived 2013-11-03
  horizontal revision

For commercial distribution, confirm trademark usage and replace these files
with licensed production assets if needed while keeping the same filenames and
`logoAsset` contract.
