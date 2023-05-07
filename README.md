# Get Git Release

Downloads a Github release file to the current working directory. 

The release can get the 'latest' release by default or a specific Github version tag.

The 'pattern in name' can be used to target a specific file to download. For example 
if you want the windows release you can add something like `-windows-`. The code will do a 
`.contains(...)` to find a matching file.

## Inputs

### gh_repo:
  description: 'Repo in the form of OWNER/REPO'
  required: true
### pattern_in_name: 
  description: 'The pattern to search for in the name of the download'
  required: true 
### gh_pat_token: 
  description: 'Github PAT token allowing access to repo and release (public repos do not need this)'
  required: false 
  default: ''
### tag-version-to-get: 
  description: 'the Github tag version to download'
  required: false 
  default: 'latest'
### ghe_url:
  description: 'Github Enterprise url'
  required: false 

## Outputs

### file_name:
  description: 'name of release that was downloaded'

## Example usage
```
name: Complete workflow for downloading XH release
on: 
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: download xh 
      id: download-xh
      uses: kc8/get_git_release@main
      with:
        gh_repo: 'ducaale/xh' 
        pattern_in_name: 'x86_64-unknown-linux-musl.tar.gz'

    - name: Un-Tar Xh
      shell: bash
      run: | 
        ls -lah
        mkdir xh_bin_dir
        ls -lah
        tar -xvf ${{ steps.download-xh.outputs.file_name }} -C xh_bin_dir --strip-components 1
        ls ./xh_bin_dir -lah

    - name: run XH
      shell: bash
      run: | 
        chmod +x ./xh_bin_dir/xh
        ./xh_bin_dir/xh httpbin.org/json
```
