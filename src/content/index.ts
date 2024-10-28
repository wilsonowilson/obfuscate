const hideEmailsInTextNodes = (node: any) => {
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

  if (node.nodeType === 3 && emailPattern.test(node.nodeValue)) {
    // Text node
    const parent = node.parentNode;
    // If the parent is already a suitable element (like a span), modify its content directly
    if (parent && ["SPAN", "BUTTON"].includes(parent.nodeName)) {
      parent.innerHTML = parent.innerHTML.replace(emailPattern, "**********");
    } else {
      // Otherwise, wrap the text node in a new span with the modified content
      const span = document.createElement("span");
      span.textContent = node.nodeValue.replace(emailPattern, "**********");
      parent.replaceChild(span, node);
    }
  }
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((n) => {
      const node = n as HTMLElement;

      if (node.nodeName === "INPUT" && node.getAttribute("type") === "email") {
        node.style.color = "transparent";
        node.style.paddingLeft = "12px";
        node.style.paddingRight = "12px";
        node.style.textShadow = "0 0 8px rgba(0,0,0,0.4)";
        return;
      }

      // Directly check text nodes in buttons or other elements
      if (
        node.nodeType === 3 &&
        node.parentNode &&
        ["BUTTON", "SPAN"].includes(node.parentNode.nodeName)
      ) {
        hideEmailsInTextNodes(node);
      }
      // For element nodes, check their child text nodes
      else if (node.nodeType === 1) {
        const textNodes = [...node.childNodes].filter(
          (n) => n.nodeType === 3 && n.nodeValue?.trim() !== ""
        );
        textNodes.forEach(hideEmailsInTextNodes);
      }
    });
  });
});

if (window.location.host.includes("app.senja.io")) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial sweep for existing text nodes in the document
  document.querySelectorAll("*").forEach((el) => {
    if (["BUTTON", "SPAN"].includes(el.nodeName) || el.childNodes.length > 0) {
      [...el.childNodes]
        .filter((n) => n.nodeType === 3 && n.nodeValue?.trim() !== "")
        .forEach(hideEmailsInTextNodes);
    }
  });
}
