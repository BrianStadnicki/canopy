window.onload = function () {

    document.getElementById('new-review-form').addEventListener('submit', addReview)

    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    } else {
        loadReviews();
    }
};

function loadReviews() {
    document.getElementById('reviews-list').innerHTML = "";

    let reviews = JSON.parse(localStorage.getItem('reviews'))
        .map(id => JSON.parse(localStorage.getItem('review-' + id)))
        .sort(function (a, b) {return a['next-attempt'] - b['next-attempt']});

    let reviewsHTML = reviews.map(review =>
        renderReview(review));

    document.getElementById('reviews-list').innerHTML = reviewsHTML.join('');
}

function renderReview(review) {
    return `
        <div id="review-${review['id']}" class="card col-5 mb-2">
            <div class="card-header">
                <h1>${review['subject']}
                    <div class="float-end fs-4">
                        ${new Date(review['next-attempt']).toLocaleDateString()}
                        <button class="btn btn-secondary me-2" data-bs-toggle="modal" data-bs-target="#edit-review-modal-${review['id']}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                            </svg>
                        </button>
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-review-${review['id']}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                        </button>
                    </div>
                </h1>
                <hr>
                <h3>${review['topic']}</h3>
                <hr>
                <h5>${review['sub-topic']}</h5>
            </div>
            <div class="card-body">
                <b>${review['content']}</b>
            </div>
            <div class="modal fade" id="modal-review-${review['id']}" tabindex="-1" aria-labelledby="modal-review-label-${review['id']}" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1>${review['subject']}</h1>     
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>                       
                        </div>
                        <div class="modal-body">
                            <h3>${review['topic']}</h3>
                            <hr>
                            <h5>${review['sub-topic']}</h5>
                            <hr>
                            <b>${review['content']}</b>
                            <hr>
                            <p style="white-space: pre-wrap;">${review['additional-information']}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="edit-review-modal-${review['id']}" tabindex="-1" aria-labelledby="edit-review-modal-label-${review['id']}" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="edit-review-modal-label-${review['id']}">Edit review</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="edit-review-form-${review['id']}" role="form" data-lpignore="true" onsubmit="modifyReview(this, ${review['id']})">
                            <div class="modal-body">
                                <div class="mb-3 form-floating">
                                    <input type="text" class="form-control" id="subject" placeholder="N/A" value="${review['subject']}" required>
                                    <label for="subject" class="form-label">Subject</label>
                                </div>
                                <div class="mb-3 form-floating">
                                    <input type="text" class="form-control" id="topic" placeholder="N/A" value="${review['topic']}" required>
                                    <label for="topic" class="form-label">Topic</label>
                                </div>
                                <div class="mb-3 form-floating">
                                    <input type="text" class="form-control" id="sub-topic" placeholder="N/A" value="${review['sub-topic']}" required>
                                    <label for="sub-topic" class="form-label">Sub-topic</label>
                                </div>
                                <div class="mb-3 form-floating">
                                    <textarea class="form-control" id="content" placeholder="N/A" required>${review['content']}</textarea>
                                    <label for="content" class="form-label">Content</label>
                                </div>
                                <div class="mb-3 form-floating">
                                    <textarea class="form-control" id="additional-information" placeholder="N/A" rows="10">${review['additional-information']}</textarea>
                                    <label for="additional-information" class="form-label">Additional information</label>
                                </div>
                                <div class="mb-3 form-floating">
                                    <textarea class="form-control" id="resources" placeholder="N/A" rows="5">${review['resources']}</textarea>
                                    <label for="resources" class="form-label">Resources</label>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button id="edit-review-modal-close-btn-${review['id']}" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button id="edit-review-modal-submit-btn-${review['id']}" type="submit" class="btn btn-primary">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        `
}

function addReview() {
    document.getElementById('create-review-model-submit-btn')["disabled"] = true;

    let review = createReview(<HTMLFormElement>document.getElementById('new-review-form'));

    localStorage.setItem('reviews', JSON.stringify(JSON.parse(localStorage.getItem('reviews')).concat(review.id)));
    localStorage.setItem('review-' + review.id, JSON.stringify(review));

    loadReviews();

    document.getElementById("create-review-model-close-btn").click();
    setTimeout(() => {
        document.getElementById('create-review-model-submit-btn')["disabled"] = false;
    }, 1000)
}

function modifyReview(form: HTMLFormElement, id: number) {
    let previousReview = JSON.parse(localStorage.getItem('review-' + id));
    let review = createReview(form);

    review['id'] = previousReview['id'];
    review['next-attempt'] = previousReview['next-attempt'];
    review['attempts'] = previousReview['attempts'];
    localStorage.setItem('review-' + review.id, JSON.stringify(review));

    document.getElementById("edit-review-modal-close-btn-" + id).click();

    loadReviews();
}

function createReview(form: HTMLFormElement) {
    let reviews = JSON.parse(localStorage.getItem('reviews'));
    let id = 0;
    if (reviews.length != 0) {
        id = reviews.at(-1) + 1;
    }

    let now = new Date();

    return {
        'id': id,
        'subject': form.elements['subject'].value,
        'topic': form.elements['topic'].value,
        'sub-topic': form.elements['sub-topic'].value,
        'content': form.elements['content'].value,
        'additional-information': form.elements['additional-information'].value,
        'resources': form.elements['resources'].value,
        'created': Date.now(),
        'next-attempt': now.setDate(now.getDate() + 1),
        'attempts': []
    };
}
