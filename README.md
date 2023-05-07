# Get Git Release

Downloads a github release file to a directory. 

The release can get 'latest' by default or a specific github version tag

The pattern in name can be used to target a specific file to download. For example 
if you want the windows release you can add something like `-windows-`

## Inputs

### gh-repo:
  description: 'repo in the form of OWNER/REPO'
  required: true

### download_to_dir: 
  description: 'where to download the release'
  required: true

### pattern_in_name: 
  description: 'the pattern to search for in the name of the download'
  required: true 
  exampe: '-gha-'

### gh_pat_token: 
  description: 'github PAT token allowing access to repo and release (public repos do not need this)'
  required: false 
  default: ''

### tag-version-to-get: 
  description: 'the github tag version to download'
  required: false 
  default: 'latest'

### ghe_url:
  description: 'Github Enterprise url'
  required: false 

## Outputs

### file_name:
    description: 'name of release that was downloaded'

## Example usage
TODO
