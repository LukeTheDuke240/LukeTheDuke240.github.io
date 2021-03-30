function email() { //opens the user's email client and prefills the email with my email as the recipient, subject and a body asking for feedback.
	window.location.href = "mailto:lukdye@tauraroa.school.nz?subject=Solar%20System%20Feedback&body=Enter%20your%20feedback%20below%20this%20line."
}

function navigateto(a) { //code to navigate to a url (better than href)
	document.body.classList.add("fadeoutclass"); //add to the document body .fadeoutclass
	const animation = document.querySelector(".fadeoutclass"); //add fadeoutclass to the const animation, to fade out the whole document
	animation.addEventListener("animationend", () => { //waits until animation has finished...
		window.location.href = a //navigate to a (passed URL)
	});
	if(!navigator.userAgent.includes("Chrome") || navigator.userAgent.includes("Edge")){ //if browser is chrome incompatible, or is edge
		window.location.href = a; //go straight to the paseed URL
	}
}