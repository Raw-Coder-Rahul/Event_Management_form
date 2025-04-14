// Get DOM elements
let form = document.getElementById("form");
let textInput = document.getElementById("textInput");
let locationInput = document.getElementById("locationInput");
let typeInput = document.getElementById("typeInput");
let dateInput = document.getElementById("dateInput");
let textarea = document.getElementById("textarea");
let imageInput = document.getElementById("imageInput");
let participantsInput = document.getElementById("participantsInput");
let msg = document.getElementById("msg");
let tasks = document.getElementById("tasks");
let add = document.getElementById("add");

// Load tasks from localStorage or create dummy data
let data = JSON.parse(localStorage.getItem("data")) || [];
if (data.length === 0) {
    let currentDate = new Date();
    for (let i = 0; i < 3; i++) {
        let newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + i * 5);
        let formattedDate = newDate.toISOString().split("T")[0];
        data.push({
            text: `Event ${i + 1}`,
            location: `Location ${i + 1}`,
            type: i % 2 === 0 ? "Online" : "Offline",
            date: formattedDate,
            description: `Description for Event ${i + 1}`,
            image: null,
            participants: Math.floor(Math.random() * 100) + 1 // Dummy participant count
        });
    }
    localStorage.setItem("data", JSON.stringify(data));
}

// Helper function to show notifications
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = type === "success" ? "alert-success" : "alert-danger";
    notification.textContent = message;
    document.body.appendChild(notification);

    notification.style.position = "fixed";
    notification.style.top = "10px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.zIndex = "1000";

    setTimeout(() => notification.remove(), 3000);
}

// Form submission listener
form.addEventListener("submit", (e) => {
    e.preventDefault();
    formValidation();
});

// Validate form inputs
let formValidation = () => {
    if (
        textInput.value.trim() === "" ||
        locationInput.value.trim() === "" ||
        typeInput.value.trim() === "" ||
        dateInput.value.trim() === "" ||
        textarea.value.trim() === "" ||
        participantsInput.value.trim() === "" || participantsInput.value <= 0
    ) {
        showNotification("All fields are required, and participants must be greater than 0!", "error");
        console.log("Validation failed");
    } else {
        showNotification("Event added successfully!", "success");
        console.log("Validation success");
        acceptData();
        add.setAttribute("data-bs-dismiss", "modal"); // Dismiss modal
        add.click();
    }
};

// Accept task data and add it to localStorage
let acceptData = () => {
    let imageFile = imageInput.files[0];
    let reader = new FileReader();

    reader.onload = function () {
        let imageBase64 = reader.result;

        data.push({
            text: textInput.value.trim(),
            location: locationInput.value.trim(),
            type: typeInput.value,
            date: dateInput.value.trim(),
            description: textarea.value.trim(),
            image: imageBase64,
            participants: parseInt(participantsInput.value.trim(), 10)
        });

        localStorage.setItem("data", JSON.stringify(data));
        console.log(data);
        createTasks();
        resetForm();
        showNotification("Event added successfully!", "success");
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile); // Convert image to Base64
    } else {
        data.push({
            text: textInput.value.trim(),
            location: locationInput.value.trim(),
            type: typeInput.value,
            date: dateInput.value.trim(),
            description: textarea.value.trim(),
            image: null,
            participants: parseInt(participantsInput.value.trim(), 10)
        });

        localStorage.setItem("data", JSON.stringify(data));
        console.log(data);
        createTasks();
        resetForm();
        showNotification("Event added successfully!", "success");
    }
};

// Render tasks dynamically
let createTasks = () => {
    tasks.innerHTML = ""; // Clear task list
    data.forEach((task, index) => {
        tasks.innerHTML += `
        <div id="${index}" class="task-box p-3 border rounded mb-3">
            <span class="fw-bold">${task.text}</span>
            <span class="small text-secondary"> | ${task.date}</span>
            <p><strong>Location:</strong> ${task.location}</p>
            <p><strong>Type:</strong> ${task.type}</p>
            <p>${task.description}</p>
            <p><strong>Max Participants:</strong> ${task.participants}</p>
            ${
                task.image
                    ? `<img src="${task.image}" class="img-fluid mb-2" style="max-height: 150px; cursor: pointer;" onclick="showFullImage('${task.image}')">`
                    : ""
            }
            <span class="options">
                <i onclick="editTask(${index})" data-bs-toggle="modal" data-bs-target="#form" class="fa-solid fa-pen-to-square"></i>
                <i onclick="deleteTask(${index})" class="fa-solid fa-trash-can"></i>
            </span>
        </div>`;
    });
};

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

// Delete task by index
let deleteTask = (index) => {
    data.splice(index, 1); // Remove task from data array
    localStorage.setItem("data", JSON.stringify(data)); // Update localStorage
    console.log(data);
    createTasks(); // Refresh task list
    showNotification("Task deleted successfully!", "success");
};

// Edit task by index
let editTask = (index) => {
    let selectedTask = data[index];
    textInput.value = selectedTask.text;
    locationInput.value = selectedTask.location;
    typeInput.value = selectedTask.type;
    dateInput.value = selectedTask.date;
    textarea.value = selectedTask.description;
    participantsInput.value = selectedTask.participants;

    deleteTask(index); // Remove old task
};

// Reset form inputs and validation messages
let resetForm = () => {
    textInput.value = "";
    locationInput.value = "";
    typeInput.value = "Online";
    dateInput.value = "";
    textarea.value = "";
    imageInput.value = "";
    participantsInput.value = "";
    msg.innerHTML = ""; // Clear validation message
};

// Render tasks on page load
(() => {
    createTasks(); // Load tasks from localStorage
    console.log(data); // Debugging
})();