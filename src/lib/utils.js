    // Helper functions

    // Get a random number between min and max, with a specified number of decimal places.
    export let getRandom = (min, max, decimalPlaces = 2) => {
        let random = Math.random() * (max - min) + min;
        return parseFloat(random.toFixed(decimalPlaces));
    };

    export let getRandomBoolean = () => {
        return Math.random() < 0.5;
    }

    export let setRandomParam = (arr, probability = null) => {
        if (probability !== null) {
            let random = getRandom(0, 100);
            if (random < probability) {
                return arr[0];
            }
        }
        let index = getRandom(0, (arr.length - 1), 0);
        return arr[index];
    };