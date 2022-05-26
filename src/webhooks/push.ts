export interface PushPayload {
  ref?: string;
  repository: {
    name: string;
    html_url: string;
  };
  description: string;
  homepage: string | null;
  language: string;
  default_branch: string;
  sender: {
    login: string;
  };
}

/** extract the branch name from push webhook payload */
const getBranchName = (payload: PushPayload): string => {
  if (!payload.ref) {
    // If no ref there is only one branch
    return payload.default_branch;
  }

  const match = payload.ref.match(/(refs\/heads\/)(.{1,})/)

  if(!match|| match.length < 3) {
    throw new Error("could not match branch")
  }

  return match[2];
};

const getRepoName = (payload: PushPayload): string => {
  return payload.repository.name
}

const getUrl = (payload: PushPayload): string => {
  return payload.repository.html_url
}



const createPushMessage = (payload: PushPayload): string => `
   ${getRepoName(payload)} has new changes on ${getBranchName(payload)}.
   See the latest changes at: ${getUrl(payload)} 🚀
`

/**
 * Receives github webhook push event and, 
* if the target branch is the default branch, executes
* the send callback
 */
export const handlePushEvent = (payload: PushPayload, send: (message: string) => void) => {
  const branch = getBranchName(payload);
  console.log(branch)
  
  if(branch === payload.default_branch) {
    const message = createPushMessage(payload)
    send(message)
  }
}
