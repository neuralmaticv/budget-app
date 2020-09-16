// BUDGET CONTROLLER
const budgetController = (() => {
    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }
        calcPercentage(totalIncome) {
            if ( totalIncome > 0 ) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }
        getPercentage() {
            return this.percentage;
        }
    }

    const calculateTotal = type => {
        let sum = 0;
        data.allItems[type].forEach( current => sum += current.value);
        data.totals[type] = sum;
    };

    const data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: (type, des, val) => {
            let newItem, ID;

            if ( data.allItems[type].length > 0 ) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if ( type === 'inc' ) {
                newItem = new Income(ID, des, val);
            } else if ( type === 'exp' ) {
                newItem = new Expense(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: (type, id) => {
            let ids, index;

            ids = data.allItems[type].map((current) => current.id);
            index = ids.indexOf(id);

            if ( index !== -1 ) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: () => {

            calculateTotal('inc');
            calculateTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;

            if ( data.totals.inc > 0 ) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: () => ({
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        }),

        calculatePercentages: () => {
            data.allItems.exp.forEach((current) => {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: () => {
            const allPercentages = data.allItems.exp.map((current) => current.getPercentage());
            return allPercentages;
        }
    };
})();


// UI CONTROLLER
const UIController = (() => {
    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expansePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    const formatNumber = (num, type) => {
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if ( int.length > 3 ) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    const nodeListForEach = (list, callback) => {
        let i;
        for ( i = 0; i < list.length; i++ ) {
            callback(list[i], i);
        }
    };

    return {
        getInput: () => ({
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        }),

        addListItem: (obj, type) => {
            let newHTML, element;

            if ( type === 'inc' ) {
                element = DOMstrings.incomeContainer;

                newHTML =  `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${formatNumber(obj.value, type)}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            } else if ( type === 'exp' ) {
                element = DOMstrings.expensesContainer;

                newHTML = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${formatNumber(obj.value, type)}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        
        deleteListItem: (selectorID) => {
            const element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: () => {
            let fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach((current, index, array) => {
                current.value = '';
            });

            fieldsArray[0].focus();
        },

        displayBudget: (obj) => {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if ( obj.percentage > 0 ) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage = '---';
            }
        },

        displayPercentages: (percentages) => {
            const fields = document.querySelectorAll(DOMstrings.expansePercLabel);

            nodeListForEach(fields, (current, index) => {

                if ( percentages[index] > 0 ) {
                     current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayDate: () => {
            let date, monthNames, month, year;

            date = new Date();
            monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

            month = date.getMonth();
            year = date.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = monthNames[month] + ' ' + year;
        },

        changedType: () => {
            const fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, (current) => {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: () => DOMstrings
    };
})();


// APP CONTROLLER
const controller = ((budgetCtrl, UICtrl) => {
    const setupEventListeners = () => {
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keydown', (event) => {
            if ( event.key === 'Enter' ) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    const updateBudget = () => {
        budgetCtrl.calculateBudget();

        const budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    };

    const updatePercentages = () => {
        budgetCtrl.calculatePercentages();

        const percentages = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(percentages);
    };

    const ctrlAddItem = () => {
        let input, newItem;

        input = UICtrl.getInput();

        if ( input.description !== '' && !isNaN(input.value) && input.value > 0 ) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();

            updateBudget();
            updatePercentages();
        }
    };

    const ctrlDeleteItem = (event) => {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if ( itemID ) {
            splitID = itemID.split('-');
            type = splitID[0];

            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);

            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: () => {
            console.log('Application has started!!!');
            UICtrl.displayDate();
            UICtrl.displayBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: 0
                }
            );
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();