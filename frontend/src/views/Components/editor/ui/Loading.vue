<template>
    <div class="loading">
        <div class="spinner" />
        <div class="loading-text">
            Loading...
        </div>
    </div>
</template>

<style>
.loading {
    background-color: white;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.8);
}

.spinner {
    border: 5px solid #f3f3f3; /* Light grey */
    border-top: 5px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;

}

@keyframes spin {
    0% { transform: rotate(0deg);  }
    100% { transform: rotate(360deg);  }

}

.loading-text {
    margin-top: 20px;
    font-size: 1.2rem;

}
</style>

