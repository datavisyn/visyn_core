export function getAllOnboardingNodes() {
  return Array.from(document.querySelectorAll('[data-onboarding-id*=onboarding-vis]')).map((node: HTMLElement) => {
    return {
      visible: node.offsetParent !== null,
      label: node.ariaLabel,
      onboardingId: node.dataset.onboardingId,
      node,
    };
  });
}

export function getOnboardingNodeById(id) {
  return document.querySelector(`[data-onboarding-id=${id}]`);
}

// @ts-ignore
window.getAllOnboardingNodes = getAllOnboardingNodes;
// @ts-ignore
window.getOnboardingNodeById = getOnboardingNodeById;
