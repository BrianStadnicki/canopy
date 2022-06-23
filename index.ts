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
                                        ${subject[0]['subject']}
                                    </div>
                                    <div class="col">
                                        <ul class="list-group">
                                            ${subject.map(review => {
                                                return `
                                                    <li class="list-group-item vstack gap-2">
                                                        <div>
                                                            <div class="float-start">${review['title']}</div>
                                                            <button class="btn btn-sm btn-primary float-end">
                                                                <img src="icons/check2-square.svg" alt="check">
                                                            </button>
                                                            <button class="btn btn-sm btn-secondary float-end me-2">
                                                                <img src="icons/pencil-square.svg" alt="edit">
                                                            </button>
                                                            ${ review['resources'].length !== 0 ? `
                                                                <button class="btn btn-sm btn-outline-primary float-end me-2" data-bs-toggle="collapse" data-bs-target="#review-collapse-${review['id']}">
                                                                    Resources
                                                                </button>
                                                            ` : '' }
                                                            
                                                        </div>
                                                        ${review['resources'].length !== 0 ? `
                                                            <div class="collapse" id="review-collapse-${review['id']}">
                                                                <div class="card card-body">
                                                                    ${review['resources'].map(resource => {
                                                                        if (resource['type'] === "url") {
                                                                            return `<a href="${resource['location']}">${resource['location']}</a>`
                                                                        } else {
                                                                            return `<span>${resource['location']}</span>`
                                                                        }
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
        'next-attempt': date.valueOf()
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
