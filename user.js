// Get DOM elements
let tasks = document.getElementById("tasks");
let registeredTasks = document.getElementById("registeredTasks");
let data = JSON.parse(localStorage.getItem("data")) || [];
let registrations = JSON.parse(localStorage.getItem("registrations")) || [];

let nameInput = document.getElementById("nameInput");
let emailInput = document.getElementById("emailInput");
let contactInput = document.getElementById("contactInput");
let participantsInput = document.getElementById("participantsInput");
let eventSelect = document.getElementById("eventSelect");
let registerEventBtn = document.getElementById("registerEventBtn");

// Helper function to show notifications at the top center
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = type === "success" ? "alert-success" : "alert-danger";
    notification.textContent = message;

    // Notification styling for top center positioning
    notification.style.position = "fixed";
    notification.style.top = "10px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.zIndex = "10000";
    notification.style.padding = "15px";
    notification.style.borderRadius = "8px";
    notification.style.fontSize = "1rem";

    document.body.appendChild(notification);

    // Auto-remove notification after 3 seconds
    setTimeout(() => notification.remove(), 5000);
}

// Render available events/tasks
function displayTasks() {
    tasks.innerHTML = ""; // Clear task list
    data.forEach((task, index) => {
        let registeredCount = registrations
            .filter(reg => reg.event === task.text)
            .reduce((sum, reg) => sum + reg.participants, 0);

        tasks.innerHTML += `
        <div id="${index}" class="event-box p-3 border rounded mb-3">
            <h6 class="fw-bold">${task.text}</h6>
            <span class="small text-secondary"> | ${task.date}</span>
            <p><strong>Location:</strong> ${task.location}</p>
            <p><strong>Type:</strong> ${task.type}</p>
            <p>${task.description}</p>
            <p><strong>Max Participants:</strong> ${task.participants}</p>
            <p><strong>Participants Joined:</strong> ${registeredCount}</p>
            ${
                task.image
                    ? `<img src="${task.image}" class="img-fluid mb-2" style="max-height: 150px; cursor: pointer;" onclick="showFullImage('${task.image}')">`
                    : ""
            }
            <button class="btn btn-primary register-button" onclick="openRegisterForm('${task.text}', ${task.participants})">Book Now</button>
        </div>`;
    });

    populateEventDropdown();
    displayRegisteredEvents();
}

// Populate event dropdown for the registration form
function populateEventDropdown() {
    eventSelect.innerHTML = ""; // Clear dropdown
    data.forEach(event => {
        let option = document.createElement("option");
        option.value = event.text;
        option.textContent = event.text;
        eventSelect.appendChild(option);
    });
}

// Open registration form with selected event pre-filled and max participants
function openRegisterForm(eventTitle, maxParticipants) {
    populateEventDropdown();
    eventSelect.value = eventTitle;
    participantsInput.setAttribute("max", maxParticipants); // Set max participants allowed
    let formModal = new bootstrap.Modal(document.getElementById("form"));
    formModal.show();
}

// Register for an event
registerEventBtn.addEventListener("click", () => {
    let userName = nameInput.value.trim();
    let userEmail = emailInput.value.trim();
    let contactNumber = contactInput.value.trim();
    let participants = parseInt(participantsInput.value.trim(), 10);
    let selectedEvent = eventSelect.value;

    // Validate inputs
    if (!userName || !userEmail || !contactNumber || !participants || participants <= 0) {
        showNotification("All fields are required, and participants must be greater than 0!", "error");
        return;
    }

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let contactRegex = /^\d{10}$/;

    if (!emailRegex.test(userEmail)) {
        showNotification("Please enter a valid email address!", "error");
        return;
    }
    if (!contactRegex.test(contactNumber)) {
        showNotification("Please enter a valid 10-digit contact number!", "error");
        return;
    }

    // Check if participants exceed the max limit
    const selectedTask = data.find(task => task.text === selectedEvent);
    if (participants > selectedTask.participants) {
        showNotification(`Participants exceed the allowed limit of ${selectedTask.participants}!`, "error");
        return;
    }

    // Add registration details
    registrations.push({
        name: userName,
        email: userEmail,
        contact: contactNumber,
        participants: participants,
        event: selectedEvent
    });
    localStorage.setItem("registrations", JSON.stringify(registrations));
    displayTasks();
    showNotification(`Successfully registered ${participants} participant(s) for ${selectedEvent}!`, "success");
    let formModal = bootstrap.Modal.getInstance(document.getElementById("form"));
    formModal.hide(); // Close registration form
});

// Display registered events dynamically
function displayRegisteredEvents() {
    registeredTasks.innerHTML = ""; // Clear registered tasks section
    registrations.forEach((reg, index) => {
        registeredTasks.innerHTML += `
        <div id="reg-${index}" class="registered-box p-3 border rounded">
            <h6 class="fw-bold">${reg.event}</h6>
            <p><strong>Name:</strong> ${reg.name}</p>
            <p><strong>Email:</strong> ${reg.email}</p>
            <p><strong>Contact:</strong> ${reg.contact}</p>
            <p><strong>Participants:</strong> ${reg.participants}</p>
            <button class="btn btn-success" onclick="markEventComplete(${index})">
                <i class="fa-solid fa-check"></i> Complete
            </button>
        </div>`;
    });
}

// Mark an event as completed
function markEventComplete(index) {
    registrations.splice(index, 1); // Remove completed event
    localStorage.setItem("registrations", JSON.stringify(registrations)); // Update localStorage
    displayRegisteredEvents(); // Refresh registered events
    showNotification("Event marked as completed!", "success");
}

// Display full image in a modal
function showFullImage(imageBase64) {
    const imageModal = document.createElement("div");
    imageModal.className = "modal fade show";
    imageModal.style.display = "block";
    imageModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body">
                    <img src="${imageBase64}" class="img-fluid">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal(this)">Close</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(imageModal);
}

// Close modal
function closeModal(button) {
    button.closest(".modal").remove();
}

// Load tasks dynamically on page load
displayTasks();