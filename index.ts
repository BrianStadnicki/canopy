enum ReviewStatus {
    NotDone,
    PartlyDone,
    Done
}

window.onload = function () {
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    } else {
        loadReviews();
    }
}

function loadReviews() {
    let reviews = JSON.parse(localStorage.getItem('reviews'))
        .map(id => JSON.parse(localStorage.getItem('review-' + id)))
        .sort(function (a, b) {return a['next-attempt'] - b['next-attempt']})
        .reduce((group, review) => {
            const date = new Date(review['next-attempt']).toLocaleDateString();
            const subject = review['subject'];
            group[date] = group[date] ?? {};
            group[date][subject] = [...group[date][subject] ?? [], review]
            return group;
        }, {});

    document.getElementById('reviews').innerHTML =
        Object.keys(reviews)
            .map(date => {
                return `
                <div id="reviews-date-${date}" class="card mb-2">
                    <div class="card-header">
                        <h1 class="fs-3">${date}</h1>
                    </div>
                    <div class="card-body">
                        ${Object.keys(reviews[date]).map(subjectKey => {
                            let subject = reviews[date][subjectKey];
                            return `
                                <div class="row mb-2 p-2 border rounded">
                                    <div class="col col-12 col-md-2 col-xl-1 mb-2 border rounded">
                                        ${sanitiseHTML(subject[0]['subject'])}
                                    </div>
                                    <div class="col">
                                        <ul class="list-group">
                                            ${subject.map(review => {
                                                return `
                                                    <li class="list-group-item vstack gap-2">
                                                        <div>
                                                            <div class="float-start">${sanitiseHTML(review['title'])}</div>
                                                            <div class="float-end row">
                                                            ${review['resources'].length !== 0 ? `
                                                                <button class="col btn btn-sm btn-outline-primary float-end me-2" data-bs-toggle="collapse" data-bs-target="#review-collapse-${review['id']}">
                                                                    Resources
                                                                </button>
                                                                ` : '' }
                                                                <button class="col btn btn-sm btn-danger float-end me-2" onclick="deleteReview(${review['id']})" title="Delete">
                                                                    <img src="icons/trash.svg" alt="delete">
                                                                </button>
                                                                <button class="col btn btn-sm btn-secondary float-end me-2" onclick="editReview(${review['id']})" data-bs-toggle="modal" data-bs-target="#modal-new-review" title="Edit">
                                                                    <img src="icons/pencil-square.svg" alt="edit">
                                                                </button>
                                                                <button class="col btn btn-sm btn-primary float-end" title="Complete">
                                                                    <img src="icons/check2-square.svg" alt="check" onclick="completedReviewBtn(${review['id']})" data-bs-toggle="modal" data-bs-target="#modal-completed-review">
                                                                </button>
                                                            </div>
                                                        </div>
                                                        ${review['resources'].length !== 0 ? `
                                                            <div class="collapse" id="review-collapse-${review['id']}">
                                                                <div class="card card-body">
                                                                    ${review['resources'].map(resource => {
                                                                        return `
                                                                            <div class="container-fluid mb-2">
                                                                                <button class="col col-4 col-md-3 col-lg-2 col-xxl-1 me-2 btn btn-outline-primary"
                                                                                    id="review-${review['id']}-resource-${review['resources'].indexOf(resource)}-btn"
                                                                                    onclick="changeResourceStatus(${review['id']}, ${review['resources'].indexOf(resource)})">
                                                                                    ${ReviewStatus.NotDone == resource['status'] ? "Not Done" : (ReviewStatus.PartlyDone == resource['status'] ? "Partly Done" : "Done")}
                                                                                </button>
                                                                                ${resource['type'] === "url" ? 
                                                                                    `<a class="col col-10" href="${sanitiseHTML(resource['location'])}" target="_blank">${resource['location']}</a>` :
                                                                                    `<span class="col col-10">${sanitiseHTML(resource['location'])}</span>`}
                                                                            </div>
                                                                        `
                                                                    }).join('')}
                                                                </div>
                                                            </div>
                                                        ` : '' }
                                                    </li>
                                                `
                                            }).join('')}
                                        </ul>
                                    </div>
                                </div>        
                            `
                        }).join('')}
                    </div>
                </div>
                `
            })
            .join('');
}

function completedReview(form: HTMLFormElement) {
    let id = form.elements['review-id'].value;
    let review = JSON.parse(localStorage.getItem('review-' + id));

    let quality = Math.round((form.elements['mark'].value / form.elements['max'].value) * 6);

    let repetitions = review['repetitions'];
    let previousInterval = review['interval'];
    let previousEaseFactor = review['ease-factor'];

    let interval: number;
    let easeFactor: number;

    if (quality >= 3) {
        switch (repetitions) {
            case 0:
                interval = 1;
                break;
            case 1:
                interval = 6;
                break;
            default:
                interval = Math.round(previousInterval * previousEaseFactor);
        }

        repetitions += 1;
        easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
        repetitions = 0;
        interval = 1;
        easeFactor = previousEaseFactor;
    }

    if (easeFactor < 1.3) {
        easeFactor = 1.3;
    }

    let date = new Date(review['next-attempt']);
    date.setDate(date.getDate() + interval);

    review['next-attempt'] = date.valueOf();
    review['interval'] = interval;
    review['repetitions'] = repetitions;
    review['ease-factor'] = easeFactor;

    localStorage.setItem('review-' + id, JSON.stringify(review));
}

function completedReviewBtn(id: number) {
    (<HTMLFormElement>document.getElementById('form-completed-review')).elements['review-id'].value = id;
}

function changeResourceStatus(reviewID: number, resourceID: number) {
    let review = JSON.parse(localStorage.getItem('review-' + reviewID));
    let currentStatus = review['resources'][resourceID]['status'];
    let newStatus = ReviewStatus.NotDone == currentStatus
        ? ReviewStatus.PartlyDone :
        (ReviewStatus.PartlyDone == currentStatus ? ReviewStatus.Done : ReviewStatus.NotDone);
    review['resources'][resourceID]['status'] = newStatus;
    localStorage.setItem('review-' + reviewID, JSON.stringify(review));

    document.getElementById('review-' + reviewID + '-resource-' + resourceID + '-btn').textContent =
        ReviewStatus.NotDone == newStatus ? "Not Done" : (ReviewStatus.PartlyDone == newStatus ? "Partly Done" : "Done");
}

function deleteReview(id: number) {
    if (confirm("Are you sure you want to delete this review?")) {
        localStorage.removeItem('review-' + id);
        localStorage.setItem('reviews', JSON.stringify(JSON.parse(localStorage.getItem('reviews')).filter(a => a !== id)));
        loadReviews();
    }
}

function editReview(id: number) {
    let newReviewBtn = document.getElementById('new-review-from-create-btn');
    let newReviewFormTitleElement = document.getElementById('form-new-review-title');

    newReviewBtn.textContent = "Save changes";
    newReviewFormTitleElement.textContent = "Edit review";

    document.getElementById('modal-new-review-resources').innerHTML = "";

    let review = JSON.parse(localStorage.getItem('review-' + id));

    let form = <HTMLFormElement>document.getElementById('form-new-review');
    let pastFormSubmit = form.onsubmit;

    form.onsubmit = function () {
        form['disabled'] = true;

        let resources = [];
        let resourceCounter = 0;
        while (form.elements['resource-location-' + resourceCounter]) {
            if (form.elements['resource-location-' + resourceCounter].value !== "") {
                resources.push({
                    'location': form.elements['resource-location-' + resourceCounter].value,
                    'type': form.elements['resource-type-' + resourceCounter].value,
                    'status': ReviewStatus.NotDone
                })
            }
            resourceCounter += 1;
        }

        let editedReview = {
            'id': id,
            'title': form.elements['title'].value,
            'subject': form.elements['subject'].value,
            'resources': resources,
            'next-attempt': review['next-attempt'],
            'repetitions': review['repetitions'],
            'interval': review['interval'],
            'ease-factor': review['ease-factor']
        }
        localStorage.setItem('review-' + editedReview['id'], JSON.stringify(editedReview));

        form.onsubmit = pastFormSubmit;
        form['disabled'] = false;

        document.getElementById('modal-new-review-resources').innerHTML = "";
        newReviewFormTitleElement.textContent = "New review";
        newReviewBtn.textContent = "Create review";

        document.getElementById('new-review-form-close-btn').click();
        loadReviews();
    }

    form.elements['title'].value = review['title'];
    form.elements['subject'].value = review['subject'];

    let resources = review['resources'];
    resources.forEach(resource => {
        formNewReviewAddResource();
        form.elements['resource-location-' + (newReviewResourcesCount - 1)].value = resource['location'];
        form.elements['resource-type-' + (newReviewResourcesCount - 1)].value = resource['type'];
    });
}

function onFormNewReviewBtn() {
    let form = <HTMLFormElement>document.getElementById('form-new-review');
    form.elements['title'].value = "";
    form.elements['subject'].value = "";
    document.getElementById('modal-new-review-resources').innerHTML = "";

    document.getElementById('new-review-from-create-btn').textContent = "Create review";
    document.getElementById('form-new-review-title').textContent = "New review";

    newReviewResourcesCount = 0;
}

function formNewReview(form: HTMLFormElement) {
    form['disabled'] = true;

    let reviews = JSON.parse(localStorage.getItem('reviews'));

    let id = 0;
    if (reviews.length != 0) {
        id = reviews.at(-1) + 1;
    }

    let resources = [];
    let resourceCounter = 0;
    while (form.elements['resource-location-' + resourceCounter]) {
        if (form.elements['resource-location-' + resourceCounter].value !== "") {
            resources.push({
                'location': form.elements['resource-location-' + resourceCounter].value,
                'type': form.elements['resource-type-' + resourceCounter].value,
                'status': ReviewStatus.NotDone
            })
        }
        resourceCounter += 1;
    }

    let date = new Date();
    date.setDate(date.getDate() + 1);

    let review = {
        'id': id,
        'title': form.elements['title'].value,
        'subject': form.elements['subject'].value,
        'resources': resources,
        'next-attempt': date.valueOf(),
        'repetitions': 1,
        'interval': 1,
        'ease-factor': 2.5
    }

    localStorage.setItem('reviews', JSON.stringify(JSON.parse(localStorage.getItem('reviews')).concat(review.id)));
    localStorage.setItem('review-' + review.id, JSON.stringify(review));

    form['disabled'] = false;
    document.getElementById('new-review-form-close-btn').click();
    loadReviews();
}

let newReviewResourcesCount = 0;

function formNewReviewAddResource() {
    document.getElementById('modal-new-review-resources').insertAdjacentHTML('beforeend',
        `
        <div class="mb-3 row g-0">
            <div class="col-sm-2">
                <select class="form-select" id="resource-type-${newReviewResourcesCount}">
                    <option value="url" selected>URL</option>
                    <option value="plain">Plain</option>
                </select>
            </div>
            <div class="col-sm">
                <input type="text" class="form-control" id="resource-location-${newReviewResourcesCount}">
            </div>
        </div>
        `
    );

    newReviewResourcesCount += 1;
}

function sanitiseHTML(text) {
    let element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}
