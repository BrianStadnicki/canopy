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

    let reviews = JSON.parse(localStorage.getItem('reviews')).map(id =>
        renderReview(JSON.parse(localStorage.getItem('review-' + id))));

    document.getElementById('reviews-list').innerHTML = reviews.join('');
}

function renderReview(review) {
    return `
        <div id="review-${review['id']}" class="card col-5 mb-2">
            <div class="card-header">
                <h1>${review['subject']}
                    <div class="float-end">
                        <button class="btn btn-secondary me-2" onclick="modifyReviewButton(${review['id']})">
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

function modifyReviewButton(id: number) {
    let createReviewModelLabel = document.getElementById('create-review-model-label');
    let createReviewModelLabelText = createReviewModelLabel.textContent;
    createReviewModelLabel.textContent = "Edit review";

    let previousReview = JSON.parse(localStorage.getItem('review-' + id));

    document.forms['new-review-form']['subject'].value = previousReview['subject'];
    document.forms['new-review-form']['topic'].value = previousReview['topic'];
    document.forms['new-review-form']['sub-topic'].value = previousReview['sub-topic'];
    document.forms['new-review-form']['content'].value = previousReview['content'];
    document.forms['new-review-form']['additional-information'].value = previousReview['additional-information'];
    document.forms['new-review-form']['resources'].value = previousReview['resources'];

    let form = <HTMLFormElement>document.getElementById('new-review-form');

    form.removeEventListener('submit', addReview);
    form.onsubmit = function () {
        let review = createReview(form);
        review['id'] = previousReview['id'];
        review['next-attempt'] = previousReview['next-attempt'];
        review['attempts'] = previousReview['attempts'];
        localStorage.setItem('review-' + review.id, JSON.stringify(review));

        form.addEventListener('submit', addReview);
        createReviewModelLabel.textContent = createReviewModelLabelText;
        document.getElementById("create-review-model-close-btn").click();

        loadReviews();
    }

    document.getElementById('create-review-modal-btn').click();
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
