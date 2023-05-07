const core = require("@actions/core");
const fs = require('fs');
const octokit = require("octokit");

const ghPatToken = core.getInput('gh_pat_token');
core.setSecret('gh_pat_token');
core.setSecret(ghPatToken);

const requested_dir = core.getInput('download_to_dir');
const ghUrl = core.getInput('gh-repo').split('/');
const owner = ghUrl[0];
const repo = ghUrl[1];

const tag_version = core.getInput('tag-version-to-get');
const pattern_in_name = core.getInput('pattern_in_name');
const gheUrl = core.getInput('ghe_url');
const ok = gheUrl && gheUrl.length > 0 ? new octokit.Octokit({ auth: ghPatToken }) : new octokit.Octokit({ auth: ghPatToken, baseUrl: gheUrl });

const onError = (err) => {
    if (err) {
        console.log("[ERROR]", err);
        core.setFailed("[ERROR] ", err);
    }
}

const getAssetId = () => {
    if (tag_version === 'latest') {
        return {
            url: `GET /repos/${owner}/${repo}/releases/latest`,
            headers: {
                owner: owner,
                repo: repo,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        }
    }
    return {
        url: `GET /repos/${owner}/${repo}/releases/tags/${tag_version}`,
        headers: {
            owner: owner,
            repo: repo,
            tag: tag_version,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }
    };
}

async function downloadAsset(releaseIdConfig) {

    const {
        url,
        headers,
    } = releaseIdConfig;
    const rawReleaseResp = await ok.request(url, headers);
    const {
        id,
    } = rawReleaseResp.data;
    const assets = await ok.request(`GET /repos/${owner}/${repo}/releases/${id}/assets`, {
        owner: owner,
        repo: repo,
        release_id: id,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
        }
    })
    const {
        data,
    } = assets;

    core.info(`Searching for a release containing the keywords ${pattern_in_name}`);
    const all_asstes = data.map(a => ({ asset_id: a.id, asset_name: a.name }));
    const found = all_asstes.filter(f => f.asset_name.includes(pattern_in_name));

    const {
        asset_id,
        asset_name,
    } = found[0]; //for now we just take the first one we find
    core.info(`Downloading ${asset_name} with id  ${asset_id}`);

    const asset_bin = await ok.request(`GET /repos/${owner}/${repo}/releases/assets/${asset_id}`, {
        owner: owner,
        repo: repo,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'accept': 'application/octet-stream'
        }
    })
    const {
        data: assetData,
    } = asset_bin;
    const assetBuffer = Buffer.from(new Uint8Array(assetData));
    fs.writeFile(`${requested_dir}/${asset_name}`, assetBuffer, onError);
    core.setOutput('file_name', asset_name);
}


function run() {
    if (ghUrl.len < 2 ||  owner < 0 || repo < 1) {
        onError("The github repo input was invalid. Make sure its in thee format of: OWNER/REPO-NAME");
    }

    if (gheUrl && gheUrl.length > 0) {
        core.info("Using GHE api", gheUrl);
    } else {
        core.info("Using public Github.com api");
    }

    core.info(`Getting ready to search in [Owner: ${owner} / Repo: ${repo}]`);

    downloadAsset(getAssetId());
}

run();
