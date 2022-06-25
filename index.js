var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus[ReviewStatus["NotDone"] = 0] = "NotDone";
    ReviewStatus[ReviewStatus["PartlyDone"] = 1] = "PartlyDone";
    ReviewStatus[ReviewStatus["Done"] = 2] = "Done";
})(ReviewStatus || (ReviewStatus = {}));
window.onload = function () {
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    }
    else {
        loadReviews();
    }
};
function loadReviews() {
    var reviews = JSON.parse(localStorage.getItem('reviews'))
        .map(function (id) { return JSON.parse(localStorage.getItem('review-' + id)); })
        .sort(function (a, b) { return a['next-attempt'] - b['next-attempt']; })
        .reduce(function (group, review) {
        var _a, _b;
        var date = new Date(review['next-attempt']).toLocaleDateString();
        var subject = review['subject'];
        group[date] = (_a = group[date]) !== null && _a !== void 0 ? _a : {};
        group[date][subject] = __spreadArray(__spreadArray([], (_b = group[date][subject]) !== null && _b !== void 0 ? _b : [], true), [review], false);
        return group;
    }, {});
    document.getElementById('reviews').innerHTML =
        Object.keys(reviews)
            .map(function (date) {
            return "\n                <div id=\"reviews-date-".concat(date, "\" class=\"card mb-2\">\n                    <div class=\"card-header\">\n                        <h1 class=\"fs-3\">").concat(date, "</h1>\n                    </div>\n                    <div class=\"card-body\">\n                        ").concat(Object.keys(reviews[date]).map(function (subjectKey) {
                var subject = reviews[date][subjectKey];
                return "\n                                <div class=\"row mb-2 p-2 border rounded\">\n                                    <div class=\"col col-12 col-md-2 col-xl-1 mb-2 border rounded\">\n                                        ".concat(sanitiseHTML(subject[0]['subject']), "\n                                    </div>\n                                    <div class=\"col\">\n                                        <ul class=\"list-group\">\n                                            ").concat(subject.map(function (review) {
                    return "\n                                                    <li class=\"list-group-item vstack gap-2\">\n                                                        <div>\n                                                            <div class=\"float-start\">".concat(sanitiseHTML(review['title']), "</div>\n                                                            <div class=\"float-end row\">\n                                                            ").concat(review['resources'].length !== 0 ? "\n                                                                <button class=\"col btn btn-sm btn-outline-primary float-end me-2\" data-bs-toggle=\"collapse\" data-bs-target=\"#review-collapse-".concat(review['id'], "\">\n                                                                    Resources\n                                                                </button>\n                                                                ") : '', "\n                                                                <button class=\"col btn btn-sm btn-danger float-end me-2\" onclick=\"deleteReview(").concat(review['id'], ")\">\n                                                                    <img src=\"icons/trash.svg\" alt=\"delete\">\n                                                                </button>\n                                                                <button class=\"col btn btn-sm btn-secondary float-end me-2\" onclick=\"editReview(").concat(review['id'], ")\" data-bs-toggle=\"modal\" data-bs-target=\"#modal-new-review\">\n                                                                    <img src=\"icons/pencil-square.svg\" alt=\"edit\">\n                                                                </button>\n                                                                <button class=\"col btn btn-sm btn-primary float-end\">\n                                                                    <img src=\"icons/check2-square.svg\" alt=\"check\" onclick=\"completedReviewBtn(").concat(review['id'], ")\" data-bs-toggle=\"modal\" data-bs-target=\"#modal-completed-review\">\n                                                                </button>\n                                                            </div>\n                                                        </div>\n                                                        ").concat(review['resources'].length !== 0 ? "\n                                                            <div class=\"collapse\" id=\"review-collapse-".concat(review['id'], "\">\n                                                                <div class=\"card card-body\">\n                                                                    ").concat(review['resources'].map(function (resource) {
                        return "\n                                                                            <div class=\"container-fluid mb-2\">\n                                                                                <button class=\"col col-4 col-md-3 col-lg-2 col-xxl-1 me-2 btn btn-outline-primary\"\n                                                                                    id=\"review-".concat(review['id'], "-resource-").concat(review['resources'].indexOf(resource), "-btn\"\n                                                                                    onclick=\"changeResourceStatus(").concat(review['id'], ", ").concat(review['resources'].indexOf(resource), ")\">\n                                                                                    ").concat(ReviewStatus.NotDone == resource['status'] ? "Not Done" : (ReviewStatus.PartlyDone == resource['status'] ? "Partly Done" : "Done"), "\n                                                                                </button>\n                                                                                ").concat(resource['type'] === "url" ?
                            "<a class=\"col col-10\" href=\"".concat(sanitiseHTML(resource['location']), "\" target=\"_blank\">").concat(resource['location'], "</a>") :
                            "<span class=\"col col-10\">".concat(sanitiseHTML(resource['location']), "</span>"), "\n                                                                            </div>\n                                                                        ");
                    }).join(''), "\n                                                                </div>\n                                                            </div>\n                                                        ") : '', "\n                                                    </li>\n                                                ");
                }).join(''), "\n                                        </ul>\n                                    </div>\n                                </div>        \n                            ");
            }).join(''), "\n                    </div>\n                </div>\n                ");
        })
            .join('');
}
function completedReview(form) {
    var id = form.elements['review-id'].value;
    var review = JSON.parse(localStorage.getItem('review-' + id));
    var quality = Math.round((form.elements['mark'].value / form.elements['max'].value) * 6);
    var repetitions = review['repetitions'];
    var previousInterval = review['interval'];
    var previousEaseFactor = review['ease-factor'];
    var interval;
    var easeFactor;
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
    }
    else {
        repetitions = 0;
        interval = 1;
        easeFactor = previousEaseFactor;
    }
    if (easeFactor < 1.3) {
        easeFactor = 1.3;
    }
    var date = new Date(review['next-attempt']);
    date.setDate(date.getDate() + interval);
    review['next-attempt'] = date.valueOf();
    review['interval'] = interval;
    review['repetitions'] = repetitions;
    review['ease-factor'] = easeFactor;
    localStorage.setItem('review-' + id, JSON.stringify(review));
}
function completedReviewBtn(id) {
    document.getElementById('form-completed-review').elements['review-id'].value = id;
}
function changeResourceStatus(reviewID, resourceID) {
    var review = JSON.parse(localStorage.getItem('review-' + reviewID));
    var currentStatus = review['resources'][resourceID]['status'];
    var newStatus = ReviewStatus.NotDone == currentStatus
        ? ReviewStatus.PartlyDone :
        (ReviewStatus.PartlyDone == currentStatus ? ReviewStatus.Done : ReviewStatus.NotDone);
    review['resources'][resourceID]['status'] = newStatus;
    localStorage.setItem('review-' + reviewID, JSON.stringify(review));
    document.getElementById('review-' + reviewID + '-resource-' + resourceID + '-btn').textContent =
        ReviewStatus.NotDone == newStatus ? "Not Done" : (ReviewStatus.PartlyDone == newStatus ? "Partly Done" : "Done");
}
function deleteReview(id) {
    if (confirm("Are you sure you want to delete this review?")) {
        localStorage.removeItem('review-' + id);
        localStorage.setItem('reviews', JSON.stringify(JSON.parse(localStorage.getItem('reviews')).filter(function (a) { return a !== id; })));
        loadReviews();
    }
}
function editReview(id) {
    var newReviewBtn = document.getElementById('new-review-from-create-btn');
    var newReviewFormTitleElement = document.getElementById('form-new-review-title');
    newReviewBtn.textContent = "Save changes";
    newReviewFormTitleElement.textContent = "Edit review";
    document.getElementById('modal-new-review-resources').innerHTML = "";
    var review = JSON.parse(localStorage.getItem('review-' + id));
    var form = document.getElementById('form-new-review');
    var pastFormSubmit = form.onsubmit;
    form.onsubmit = function () {
        form['disabled'] = true;
        var resources = [];
        var resourceCounter = 0;
        while (form.elements['resource-location-' + resourceCounter]) {
            if (form.elements['resource-location-' + resourceCounter].value !== "") {
                resources.push({
                    'location': form.elements['resource-location-' + resourceCounter].value,
                    'type': form.elements['resource-type-' + resourceCounter].value,
                    'status': ReviewStatus.NotDone
                });
            }
            resourceCounter += 1;
        }
        var editedReview = {
            'id': id,
            'title': form.elements['title'].value,
            'subject': form.elements['subject'].value,
            'resources': resources,
            'next-attempt': review['next-attempt'],
            'repetitions': review['repetitions'],
            'interval': review['interval'],
            'ease-factor': review['ease-factor']
        };
        localStorage.setItem('review-' + editedReview['id'], JSON.stringify(editedReview));
        form.onsubmit = pastFormSubmit;
        form['disabled'] = false;
        document.getElementById('modal-new-review-resources').innerHTML = "";
        newReviewFormTitleElement.textContent = "New review";
        newReviewBtn.textContent = "Create review";
        document.getElementById('new-review-form-close-btn').click();
        loadReviews();
    };
    form.elements['title'].value = review['title'];
    form.elements['subject'].value = review['subject'];
    var resources = review['resources'];
    resources.forEach(function (resource) {
        formNewReviewAddResource();
        form.elements['resource-location-' + (newReviewResourcesCount - 1)].value = resource['location'];
        form.elements['resource-type-' + (newReviewResourcesCount - 1)].value = resource['type'];
    });
}
function onFormNewReviewBtn() {
    var form = document.getElementById('form-new-review');
    form.elements['title'].value = "";
    form.elements['subject'].value = "";
    document.getElementById('modal-new-review-resources').innerHTML = "";
    document.getElementById('new-review-from-create-btn').textContent = "Create review";
    document.getElementById('form-new-review-title').textContent = "New review";
    newReviewResourcesCount = 0;
}
function formNewReview(form) {
    form['disabled'] = true;
    var reviews = JSON.parse(localStorage.getItem('reviews'));
    var id = 0;
    if (reviews.length != 0) {
        id = reviews.at(-1) + 1;
    }
    var resources = [];
    var resourceCounter = 0;
    while (form.elements['resource-location-' + resourceCounter]) {
        if (form.elements['resource-location-' + resourceCounter].value !== "") {
            resources.push({
                'location': form.elements['resource-location-' + resourceCounter].value,
                'type': form.elements['resource-type-' + resourceCounter].value,
                'status': ReviewStatus.NotDone
            });
        }
        resourceCounter += 1;
    }
    var date = new Date();
    date.setDate(date.getDate() + 1);
    var review = {
        'id': id,
        'title': form.elements['title'].value,
        'subject': form.elements['subject'].value,
        'resources': resources,
        'next-attempt': date.valueOf(),
        'repetitions': 1,
        'interval': 1,
        'ease-factor': 2.5
    };
    localStorage.setItem('reviews', JSON.stringify(JSON.parse(localStorage.getItem('reviews')).concat(review.id)));
    localStorage.setItem('review-' + review.id, JSON.stringify(review));
    form['disabled'] = false;
    document.getElementById('new-review-form-close-btn').click();
    loadReviews();
}
var newReviewResourcesCount = 0;
function formNewReviewAddResource() {
    document.getElementById('modal-new-review-resources').insertAdjacentHTML('beforeend', "\n        <div class=\"mb-3 row g-0\">\n            <div class=\"col-sm-2\">\n                <select class=\"form-select\" id=\"resource-type-".concat(newReviewResourcesCount, "\">\n                    <option value=\"url\" selected>URL</option>\n                    <option value=\"plain\">Plain</option>\n                </select>\n            </div>\n            <div class=\"col-sm\">\n                <input type=\"text\" class=\"form-control\" id=\"resource-location-").concat(newReviewResourcesCount, "\">\n            </div>\n        </div>\n        "));
    newReviewResourcesCount += 1;
}
function sanitiseHTML(text) {
    var element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}
